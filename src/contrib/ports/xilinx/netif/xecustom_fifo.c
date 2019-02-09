#include "lwipopts.h"
#include "xlwipconfig_custom.h"

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

void xecustom_fifo_setmac(u32_t index, u8_t *addr)
{
    return;
}
err_t 	xecustom_fifo_init(struct netif *netif)
{
    return (err_t) 0;
}
int 	xecustom_fifo_input(struct netif *netif)
{
    return 0;
}