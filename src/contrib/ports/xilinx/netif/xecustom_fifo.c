#include "lwipopts.h"
#include "xlwipconfig.h"

#if !NO_SYS
#ifdef OS_IS_XILKERNEL
#include "xmk.h"
#include "sys/intr.h"
#endif
#ifdef OS_IS_FREERTOS
#include "FreeRTOS.h"
#include "semphr.h"
#include "timers.h"
#endif
#include "lwip/sys.h"
#include "lwip/timers.h"
#endif

#include <stdio.h>
#include <string.h>
#include "xil_printf.h"
#include "lwip/opt.h"
#include "lwip/def.h"
#include "lwip/mem.h"
#include "lwip/pbuf.h"
#include "lwip/sys.h"
#include "lwip/stats.h"

#include "netif/etharp.h"
#include "netif/xadapter.h"
#include "netif/xecustom_fifo.h"
#include "xstatus.h"

#include "netif/xpqueue.h"

#include "xlwipconfig.h"
#include "xparameters.h"
#if XLWIP_CONFIG_INCLUDE_EMACLITE_ON_ZYNQ == 1
#include "xscugic.h"
#define INTC_DIST_BASE_ADDR	XPAR_SCUGIC_DIST_BASEADDR
#else
#include "xintc.h"
#endif

#define LWIP_DEBUG 0

/* Define those to better describe your network interface. */
// whatever
#define IFNAME0 'w'
#define IFNAME1 'e'

// ********** code from xaxiemacif_fifo.c BEGIN
#include "xintc_l.h"
#include "xstatus.h"

#if XPAR_INTC_0_HAS_FAST == 1

static void xllfifo_fastintr_handler(void) __attribute__ ((fast_interrupt));


/** Variables for Fast Interrupt handlers ***/
struct xemac_s *xemac_fast;
xecustom_fifo_s *xecustom_fifo_fast;
#endif

int is_tx_space_available(xecustom_fifo_s *emac)
{
	return ((XLlFifo_TxVacancy(&emac->axififo) * 4) > 1518); //XAE_MAX_FRAME_SIZE);
}

static void
xllfifo_recv_handler(struct xemac_s *xemac)
{
	u32_t frame_length;
	struct pbuf *p;
	xecustom_fifo_s *xecustom_fifo = (xecustom_fifo_s *)(xemac->state);
	XLlFifo *llfifo = &xecustom_fifo->axififo;

	/* While there is data in the fifo ... */
	while (XLlFifo_RxOccupancy(llfifo)) {
		/* find packet length */
		frame_length = XLlFifo_RxGetLen(llfifo);
		/* allocate a pbuf */
		p = pbuf_alloc(PBUF_RAW, frame_length, PBUF_POOL);
		if (!p) {
                        char tmp_frame[1518];//XAE_MAX_FRAME_SIZE];
#if LINK_STATS
			lwip_stats.link.memerr++;
			lwip_stats.link.drop++;
#endif
			/* receive and drop packet to keep data & len registers in sync */
		        XLlFifo_Read(llfifo, tmp_frame, frame_length);

			continue;
                }

		/* receive packet */
		XLlFifo_Read(llfifo, p->payload, frame_length);
		if(LWIP_DEBUG){
			xil_printf("recv_handler: frame_length = %d\r\n", frame_length);
		}
		/* store it in the receive queue, where it'll be processed by xemacif input thread */
		if (pq_enqueue(xecustom_fifo->recv_q, (void*)p) < 0) {
#if LINK_STATS
			lwip_stats.link.memerr++;
			lwip_stats.link.drop++;
#endif
			pbuf_free(p);
			continue;
		}

#if LINK_STATS
		lwip_stats.link.recv++;
#endif
	}
}

static void
fifo_error_handler(xecustom_fifo_s *xecustom_fifo, u32_t pending_intr)
{
	XLlFifo *llfifo = &xecustom_fifo->axififo;

	if (pending_intr & XLLF_INT_RPURE_MASK) {
		print("llfifo: Rx under-read error");
	}
	if (pending_intr & XLLF_INT_RPORE_MASK) {
		print("llfifo: Rx over-read error");
	}
	if (pending_intr & XLLF_INT_RPUE_MASK) {
		print("llfifo: Rx fifo empty");
	}
	if (pending_intr & XLLF_INT_TPOE_MASK) {
		print("llfifo: Tx fifo overrun");
	}
	if (pending_intr & XLLF_INT_TSE_MASK) {
		print("llfifo: Tx length mismatch");
	}

	/* Reset the tx or rx side of the fifo as needed */
	if (pending_intr & XLLF_INT_RXERROR_MASK) {
		XLlFifo_IntClear(llfifo, XLLF_INT_RRC_MASK);
		XLlFifo_RxReset(llfifo);
	}

	if (pending_intr & XLLF_INT_TXERROR_MASK) {
		XLlFifo_IntClear(llfifo, XLLF_INT_TRC_MASK);
		XLlFifo_TxReset(llfifo);
	}
}

static void
xllfifo_intr_handler(struct xemac_s *xemac)
{
	xecustom_fifo_s *xecustom_fifo = (xecustom_fifo_s *)(xemac->state);
	XLlFifo *llfifo = &xecustom_fifo->axififo;

	u32_t pending_fifo_intr = XLlFifo_IntPending(llfifo);

	while (pending_fifo_intr) {
		if (pending_fifo_intr & XLLF_INT_RC_MASK) {
			/* receive interrupt */
			XLlFifo_IntClear(llfifo, XLLF_INT_RC_MASK);
			xllfifo_recv_handler(xemac);
		} else if (pending_fifo_intr & XLLF_INT_TC_MASK) {
			/* tx intr */
			XLlFifo_IntClear(llfifo, XLLF_INT_TC_MASK);
		} else {
			XLlFifo_IntClear(llfifo, XLLF_INT_ALL_MASK &
					 ~(XLLF_INT_RC_MASK |
					   XLLF_INT_TC_MASK));
			fifo_error_handler(xecustom_fifo, pending_fifo_intr);
		}
		pending_fifo_intr = XLlFifo_IntPending(llfifo);
	}

}

XStatus init_axi_fifo(struct xemac_s *xemac)
{
	xecustom_fifo_s *xecustom_fifo = (xecustom_fifo_s *)(xemac->state);
#if XPAR_INTC_0_HAS_FAST == 1
	xecustom_fifo_fast = xecustom_fifo;
	xemac_fast = xemac;
#endif
#if NO_SYS
	struct xtopology_t *xtopologyp = &xtopology[xemac->topology_index];
#endif


	/* initialize ll fifo */
	XLlFifo_Initialize(&xecustom_fifo->axififo,
			XPAR_MB_ETH_SYSTEM_AXI_FIFO_MM_S_0_BASEADDR);
			//XPAR_AXI_FIFO_MM_S_0_BASEADDR); //0x44A00000U

	/* Clear any pending FIFO interrupts */
	XLlFifo_IntClear(&xecustom_fifo->axififo, XLLF_INT_ALL_MASK);

	/* enable fifo interrupts */
	XLlFifo_IntEnable(&xecustom_fifo->axififo, XLLF_INT_ALL_MASK);



#if XPAR_INTC_0_HAS_FAST == 1


	/* connect & enable FIFO interrupt */
	XIntc_RegisterFastHandler(xtopologyp->intc_baseaddr,
			XPAR_MB_ETH_SYSTEM_MICROBLAZE_0_AXI_INTC_MB_ETH_SYSTEM_AXI_FIFO_MM_S_0_INTERRUPT_INTR, //0U
			//XPAR_MICROBLAZE_0_AXI_INTC_AXI_FIFO_MM_S_0_INTERRUPT_INTR, //4U
			(XFastInterruptHandler)xllfifo_fastintr_handler);

#endif
	/* Enable EMAC interrupts in the interrupt controller */
	do {
		/* read current interrupt enable mask */
		unsigned int cur_mask = XIntc_In32(xtopologyp->intc_baseaddr + XIN_IER_OFFSET);

		/* form new mask enabling SDMA & ll_temac interrupts */
		cur_mask = cur_mask

				| (1 << XPAR_MB_ETH_SYSTEM_MICROBLAZE_0_AXI_INTC_MB_ETH_SYSTEM_AXI_FIFO_MM_S_0_INTERRUPT_INTR);
			//	| (1 << XPAR_MICROBLAZE_0_AXI_INTC_AXI_FIFO_MM_S_0_INTERRUPT_INTR);

		/* set new mask */
		XIntc_EnableIntr(xtopologyp->intc_baseaddr, cur_mask);
	} while (0);

	return 0;
}

XStatus axififo_send(xecustom_fifo_s *xecustom_fifo, struct pbuf *p)
{
	XLlFifo *llfifo = &xecustom_fifo->axififo;
	u32_t l = 0;
	struct pbuf *q;

	for(q = p; q != NULL; q = q->next) {
		/* write frame data to FIFO */
		XLlFifo_Write(llfifo, q->payload, q->len);
		l += q->len;
		if(LWIP_DEBUG){
			xil_printf("axififo_send: qlen = %d\r\n", q->len);
		}
	}

	/* initiate transmit */
	if(LWIP_DEBUG){
		xil_printf("axififo_send: l = %d\r\n", l);
	}
	XLlFifo_TxSetLen(llfifo, l);

	return 0;
}

#if XPAR_INTC_0_HAS_FAST == 1
/********** Fast Interrupt handler *****************************************/
void xllfifo_fastintr_handler(void)
{
	xllfifo_intr_handler(xemac_fast);
}
#endif

// ********** code from xaxiemacif_fifo.c END


/*
 * xecustom_fifo_output():
 *
 * This function is called by the TCP/IP stack when an IP packet
 * should be sent. It calls the function called low_level_output() to
 * do the actual transmission of the packet.
 *
 */
static err_t xecustom_fifo_output(struct netif *netif, struct pbuf *p,
		ip_addr_t *ipaddr)
{
	/* resolve hardware address, then send (or queue) packet */
	return etharp_output(netif, p, ipaddr);
}

/*
 * this function is always called with interrupts off
 * this function also assumes that there are available BD's
 */
static err_t _unbuffered_low_level_output(xecustom_fifo_s *xecustom_fifo,
														struct pbuf *p)
{
	XStatus status = 0;
	if(LWIP_DEBUG){
		int i;
		xil_printf("output: len: %d BEGIN\r\n", p->len);
		for(i = 0; i < p->len; i++){
			xil_printf("i = %d: %x\r\n", i, (char)(((char*)p->payload)[i]));
		}
		xil_printf("output END\r\n");
	}
    status = axififo_send(xecustom_fifo, p);


	if (status != XST_SUCCESS) {
#if LINK_STATS
		lwip_stats.link.drop++;
#endif
	}

#if LINK_STATS
	lwip_stats.link.xmit++;
#endif /* LINK_STATS */

	return ERR_OK;

}

/*
 * low_level_output():
 *
 * Should do the actual transmission of the packet. The packet is
 * contained in the pbuf that is passed to the function. This pbuf
 * might be chained.
 *
 */

static err_t low_level_output(struct netif *netif, struct pbuf *p)
{
        SYS_ARCH_DECL_PROTECT(lev);
        err_t err;
        struct xemac_s *xemac = (struct xemac_s *)(netif->state);
        xecustom_fifo_s *xecustom_fifo = (xecustom_fifo_s *)(xemac->state);

        int count = 100;

        SYS_ARCH_PROTECT(lev);
        _unbuffered_low_level_output(xecustom_fifo, p);
        
    #if LINK_STATS
        lwip_stats.link.xmit++;
    #endif /* LINK_STATS */
        
        err = ERR_OK;

        SYS_ARCH_UNPROTECT(lev);
        return err;
}

void xecustom_fifo_setmac(u32_t index, u8_t *addr)
{
    return;
}

static err_t low_level_init(struct netif *netif)
{
	unsigned mac_address = (unsigned)(UINTPTR)(netif->state);
	struct xemac_s *xemac;
	xecustom_fifo_s *xecustom_fifo;
	//XAxiEthernet_Config *mac_config;

	xecustom_fifo = mem_malloc(sizeof *xecustom_fifo);
	if (xecustom_fifo == NULL) {
		LWIP_DEBUGF(NETIF_DEBUG, ("xecustom_fifo_init: out of memory\r\n"));
		return ERR_MEM;
	}

	xemac = mem_malloc(sizeof *xemac);
	if (xemac == NULL) {
		LWIP_DEBUGF(NETIF_DEBUG, ("xecustom_fifo_init: out of memory\r\n"));
		return ERR_MEM;
	}

	xemac->state = (void *)xecustom_fifo;
	xemac->topology_index = xtopology_find_index(mac_address);
	xemac->type = xemac_custom_fifo;

	xecustom_fifo->send_q = NULL;
	xecustom_fifo->recv_q = pq_create_queue();
	if (!xecustom_fifo->recv_q)
		return ERR_MEM;

	netif->mtu = 1486;


	netif->flags = NETIF_FLAG_BROADCAST | NETIF_FLAG_ETHARP |
				   NETIF_FLAG_LINK_UP;
                   

	init_axi_fifo(xemac);

	netif->state = (void *)xemac;

	return ERR_OK;
}

err_t 	xecustom_fifo_init(struct netif *netif)
{
    netif->name[0] = IFNAME0;
	netif->name[1] = IFNAME1;
	netif->output = xecustom_fifo_output;
	netif->linkoutput = low_level_output;
    low_level_init(netif);
    return (err_t) 0;
}


/*
 * low_level_input():
 *
 * Should allocate a pbuf and transfer the bytes of the incoming
 * packet from the interface into the pbuf.
 *
 */
static struct pbuf *low_level_input(struct netif *netif)
{
	struct xemac_s *xemac = (struct xemac_s *)(netif->state);
	xecustom_fifo_s *xecustom_fifo = (xecustom_fifo_s *)(xemac->state);
	struct pbuf *p;

	/* see if there is data to process */
	if (pq_qlength(xecustom_fifo->recv_q) == 0)
		return NULL;

	/* return one packet from receive q */
	p = (struct pbuf *)pq_dequeue(xecustom_fifo->recv_q);
	if(LWIP_DEBUG){
		int i;
		xil_printf("input: len: %d BEGIN\r\n", p->len);
		for(i = 0; i < p->len; i++){
			xil_printf("i = %d: %x\r\n", i, (char)(((char*)p->payload)[i]));
		}
		xil_printf("input END\r\n");
	}
	return p;
}

int 	xecustom_fifo_input(struct netif *netif)
{
	struct eth_hdr *ethhdr;
	struct pbuf *p;
	SYS_ARCH_DECL_PROTECT(lev);

	{
		/* move received packet into a new pbuf */
		SYS_ARCH_PROTECT(lev);
		p = low_level_input(netif);
		SYS_ARCH_UNPROTECT(lev);

		/* no packet could be read, silently ignore this */
		if (p == NULL)
			return 0;

		/* points to packet payload, which starts with an Ethernet header */
		ethhdr = p->payload;

#if LINK_STATS
		lwip_stats.link.recv++;
#endif /* LINK_STATS */

		switch (htons(ethhdr->type)) {
			/* IP or ARP packet? */
			case ETHTYPE_IP:
			case ETHTYPE_ARP:
#if LWIP_IPV6
			/*IPv6 Packet?*/
			case ETHTYPE_IPV6:
#endif
#if PPPOE_SUPPORT
				/* PPPoE packet? */
			case ETHTYPE_PPPOEDISC:
			case ETHTYPE_PPPOE:
#endif /* PPPOE_SUPPORT */
				/* full packet send to tcpip_thread to process */
				if (netif->input(p, netif) != ERR_OK) {
					LWIP_DEBUGF(NETIF_DEBUG, ("xecustom_fifo_input: IP input error\r\n"));
					pbuf_free(p);
					p = NULL;
				}
				break;

			default:
				pbuf_free(p);
				p = NULL;
				break;
		}
	}
	return 1;
}

