/******************************************************************************
*
* Copyright (C) 2009 - 2014 Xilinx, Inc.  All rights reserved.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* Use of the Software is limited solely to applications:
* (a) running on a Xilinx device, or
* (b) that interact with a Xilinx device through a bus or interconnect.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* XILINX  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
* OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* Except as contained in this notice, the name of the Xilinx shall not be used
* in advertising or otherwise to promote the sale, use or other dealings in
* this Software without prior written authorization from Xilinx.
*
******************************************************************************/

#include <stdio.h>
#include <string.h>

#include "lwip/err.h"
#include "lwip/tcp.h"
#include "xparameters.h"
#include "xil_io.h"
#if defined (__arm__) || defined (__aarch64__)
#include "xil_printf.h"
#endif

extern unsigned int temp_threshold;
volatile char* reset_ip = (char *)XPAR_SHELL_I_TEMP_IP_AUTO_RESET_10BITS_0_S00_AXI_BASEADDR;

//header file for reset ip
#include "auto_reset_10bits.h"

int transfer_data() {
	return 0;
}

#define TEMP_REQ 1
#define TEMP_RESP 2
#define RESET_CMD 3
#define RESET_ACK 4
#define RESET_NACK 5
#define THRESHOLD_SET 6
#define THRESHOLD_ACK 7
#define THRESHOLD_NACK 8
#define READ_MEM 9
#define READ_MEM_ACK 10
#define READ_MEM_NACK 11
#define WRITE_MEM 12
#define WRITE_MEM_ACK 13
#define WRITE_MEM_NACK 14
#define INVALID_PT 0x30303030

/* no used yet
#define PACKET_TYPE_OFFSET 0
#define CLIENT_ID_OFFSET 4
#define THRESHOLD_OFFSET 8
*/

#define LISTEN_PORT 7

volatile char* SYSMON = (char *)XPAR_SYSMON_0_BASEADDR;

#define MEM_BOT 0x80100000
#define MEM_TOP 0xFFFFFFFF

void print_app_header()
{
#if (LWIP_IPV6==0)
	xil_printf("\n\r\n\r-----lwIP TCP echo server ------\n\r");
#else
	xil_printf("\n\r\n\r-----lwIPv6 TCP echo server ------\n\r");
#endif
	xil_printf("TCP packets sent to port 6001 will be echoed back\n\r");
}

u32 get_ADC_threshold(u32 decimal_threshold){
	/* when you actually want to test the functionality
	int temp_threshold = ceil((threshold + 273.6777) * 1024 / 501.3743);
	*/
	u32 ADC_threshold = ((decimal_threshold + 273.6777) * 1024 / 501.3743) + 1;
	return ADC_threshold;
}

void hard_reset(volatile char* reset_baseaddr){
	AUTO_RESET_10BITS_mWriteReg(reset_baseaddr, 0x0, 1);
}

void set_threshold(volatile char* reset_baseaddr, u32 threshold){
	u32 temp_threshold = get_ADC_threshold(threshold);
	AUTO_RESET_10BITS_mWriteReg(reset_ip, 0x4, temp_threshold);
	AUTO_RESET_10BITS_mWriteReg(reset_ip, 0x8, 1);
}

err_t recv_callback(void *arg, struct tcp_pcb *tpcb,
                               struct pbuf *p, err_t err)
{
	/* do not read the packet if we are not in ESTABLISHED state */
	if (!p) {
		tcp_close(tpcb);
		tcp_recv(tpcb, NULL);
		return ERR_OK;
	}

	/* indicate that the packet has been received */
	tcp_recved(tpcb, p->len);

	u32 to_send[256] = {0};
	u32 recv[256] = {0};
	memcpy(recv, p->payload, p->len);
	recv[p->len] ='\n';
	u32 client_id = recv[0];
    u32 packet_type = recv[1];
	/* number of bytes to send. Initialize to be 4 because
	   the reply will be at least 8 bytes to include protocol number and client ID*/
	int send_length = 8;
    // anyway the first 4 bytes should be packet identifier

	to_send[0] = client_id;
	// In this switch, we only manipulate packet, the value will be sent at end of function
	switch(packet_type){
		case TEMP_REQ:
			print("TEMP REQ\r\n");
			int ADC_CODE = (*(int*)(SYSMON + 0x400)) >> 6;
			to_send[1] = TEMP_RESP;
			to_send[2] = ADC_CODE;
			send_length += 4;
			break;
		case RESET_CMD:
			print("RESET CMD\r\n");
			int i=0;
			for(i=0; i++; i<100){
				print("RESET CMD\r\n");
			}
			hard_reset(reset_ip);
			// if the reset is successful, this packet should never be sent
			print("RESET FAILED, board comes alive\r\n");
			to_send[1] = RESET_NACK;
			break;
		case THRESHOLD_SET:
			print("Threshold set\r\n");
			int threshold = recv[2];
			xil_printf("receive threshold %x\r\n", threshold);
			set_threshold(reset_ip, threshold);
			to_send[1] = THRESHOLD_ACK;

			break;
		case READ_MEM:
			print("READ_MEM\r\n");
			u32 read_addr = recv[2];
			u32 read_length = recv[3];
			xil_printf("read mem at 0x%08x, length %x\r\n", read_addr, read_length);
			if(read_addr >= MEM_BOT && read_addr + read_length <= MEM_TOP){
				to_send[1] = READ_MEM_ACK;
				memcpy((char*)&to_send[2], (char*)read_addr, read_length);
				send_length += read_length;
			}
			else{
				to_send[1] = READ_MEM_NACK;
			}
			break;
		case WRITE_MEM:
			print("WRITE_MEM\r\n");
			u32 write_addr =recv[2];
			u32 write_length =recv[3];
			xil_printf("write mem at 0x%08x, length %x\r\n", write_addr, write_length);
			if(write_addr >= MEM_BOT && write_addr + write_length <= MEM_TOP){
				to_send[1] = WRITE_MEM_ACK;
				print("ACK");
				memcpy((char*)write_addr, &recv[4], write_length);
			}
			else{
				print("NACK");
				to_send[1] = WRITE_MEM_NACK;
			}
			break;
		default:
			to_send[1] = INVALID_PT;
	}

	/* echo back the payload */
	/* in this case, we assume that the payload is < TCP_SND_BUF */
	if (tcp_sndbuf(tpcb) > send_length) {
		err = tcp_write(tpcb, to_send, send_length, 1);
	} else
		xil_printf("no space in tcp_sndbuf\n\r");

	/* free the received pbuf */
	pbuf_free(p);

	return ERR_OK;
}

err_t accept_callback(void *arg, struct tcp_pcb *newpcb, err_t err)
{
	static int connection = 1;

	/* set the receive callback for this connection */
	tcp_recv(newpcb, recv_callback);

	/* just use an integer number indicating the connection id as the
	   callback argument */
	tcp_arg(newpcb, (void*)(UINTPTR)connection);

	/* increment for subsequent accepted connections */
	connection++;

	return ERR_OK;
}


int start_application()
{
	struct tcp_pcb *pcb;
	err_t err;
	unsigned port = LISTEN_PORT;

	/* create new TCP PCB structure */
	pcb = tcp_new_ip_type(IPADDR_TYPE_ANY);
	if (!pcb) {
		xil_printf("Error creating PCB. Out of Memory\n\r");
		return -1;
	}

	/* bind to specified @port */
	err = tcp_bind(pcb, IP_ANY_TYPE, port);
	if (err != ERR_OK) {
		xil_printf("Unable to bind to port %d: err = %d\n\r", port, err);
		return -2;
	}

	/* we do not need any arguments to callback functions */
	tcp_arg(pcb, NULL);

	/* listen for connections */
	pcb = tcp_listen(pcb);
	if (!pcb) {
		xil_printf("Out of memory while tcp_listen\n\r");
		return -3;
	}

	/* specify callback to use for incoming connections */
	tcp_accept(pcb, accept_callback);

	xil_printf("TCP echo server started @ port %d\n\r", port);

	return 0;
}
