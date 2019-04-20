//===============================
// AUTHOR     : Naif Tarafdar and Nariman Eskandari
// CREATE DATE     : June 15, 2018
//===============================


#include "ap_int.h"
#include "hls_stream.h"
#include "ap_utils.h"

struct eth_axis{
	ap_int <64> data;
	ap_uint<1> last;
	ap_uint<8> tkeep;
};

ap_uint <64> reverseEndian64_data(ap_uint <64> X) {
  ap_uint <64> x = X;
  x = (x & 0x00000000FFFFFFFF) << 32 | (x & 0xFFFFFFFF00000000) >> 32;
  x = (x & 0x0000FFFF0000FFFF) << 16 | (x & 0xFFFF0000FFFF0000) >> 16;
  x = (x & 0x00FF00FF00FF00FF) << 8  | (x & 0xFF00FF00FF00FF00) >> 8;
  return x;
}

//eth_to_app states
#define INIT_PACKET_FILTER 0
#define READ_DEST_PACKET_FILTER 1
#define STREAM_FIRST_PKT_PR 2
#define STREAM_SECOND_PKT_PR 3
#define STREAM_PR 4
#define STREAM_FIRST_PKT_SHELL 5
#define STREAM_SECOND_PKT_SHELL 6
#define STREAM_SHELL 7

void packet_filtering(
		hls::stream <eth_axis> & from_eth,
        hls::stream <eth_axis> & to_shell,
		hls::stream <eth_axis> & to_pr,
		const ap_uint <48> src_mac_addr,	
		const ap_uint <1> debug_bit)
{
#pragma HLS PIPELINE II=1

    static ap_uint <4> state = 0;
    static ap_uint <16> type;
    static eth_axis eth_packet_in;
    static eth_axis app_packet_out;
	static eth_axis first_packet_in;
	static eth_axis first_packet_org;
	static eth_axis second_packet_in;
	static eth_axis second_packet_org;
	ap_int <48> observedAddress;
    
	switch (state)
    {
        //read header 
        case INIT_PACKET_FILTER:
		    if (!from_eth.empty()){
                first_packet_org = from_eth.read();
                first_packet_in.data = reverseEndian64_data(first_packet_org.data);
                state = READ_DEST_PACKET_FILTER;	
            }
            break;
        case READ_DEST_PACKET_FILTER:
		    if (!from_eth.empty()){
                second_packet_org = from_eth.read();
                second_packet_in.data = reverseEndian64_data(second_packet_org.data);
                observedAddress = (first_packet_in.data.range(15,0) << 32) | (second_packet_in.data.range(63,32));

				//check type, if it's in debug mode, pass all packets regardless dest addr
				if(debug_bit == 1){
					state = STREAM_FIRST_PKT_SHELL;
				}
				else{
					if(observedAddress == src_mac_addr){
						//packet to shell region, check the dest addr
						state = STREAM_FIRST_PKT_SHELL;	
					}
					else{
						//packet to pr region
						state = STREAM_FIRST_PKT_PR;
					}
				}
            }
            break;
		case STREAM_FIRST_PKT_PR: 
			app_packet_out.tkeep = first_packet_org.tkeep;
            app_packet_out.data = first_packet_org.data;
            app_packet_out.last = first_packet_org.last;
			to_pr.write(app_packet_out);
			state = STREAM_SECOND_PKT_PR;
			break;
		case STREAM_SECOND_PKT_PR:	
			app_packet_out.tkeep = second_packet_org.tkeep;
            app_packet_out.data = second_packet_org.data;
            app_packet_out.last = second_packet_org.last;
            to_pr.write(app_packet_out);
			state = STREAM_PR;
			break;
        case STREAM_PR: 
		    if (!from_eth.empty()){
                eth_packet_in = from_eth.read(); 
                app_packet_out.tkeep = eth_packet_in.tkeep;
                app_packet_out.data = eth_packet_in.data;
                app_packet_out.last = eth_packet_in.last;
                to_pr.write(app_packet_out);
            }
            if(app_packet_out.last){
                state = INIT_PACKET_FILTER;
            }
            else{
                state = STREAM_PR;
            }
            break;
        case STREAM_FIRST_PKT_SHELL: 
			app_packet_out.tkeep = first_packet_org.tkeep;
            app_packet_out.data = first_packet_org.data;
            app_packet_out.last = first_packet_org.last;
            to_shell.write(app_packet_out);
			state = STREAM_SECOND_PKT_SHELL;
			break;
		case STREAM_SECOND_PKT_SHELL:	
			app_packet_out.tkeep = second_packet_org.tkeep;
            app_packet_out.data = second_packet_org.data;
            app_packet_out.last = second_packet_org.last;
            to_shell.write(app_packet_out);
			state = STREAM_SHELL;
			break;
        case STREAM_SHELL: 
		    if (!from_eth.empty()){
                eth_packet_in = from_eth.read(); 
                app_packet_out.tkeep = eth_packet_in.tkeep;
                app_packet_out.data = eth_packet_in.data;
                app_packet_out.last = eth_packet_in.last;
                to_shell.write(app_packet_out);
            }
            if(app_packet_out.last){
                state = INIT_PACKET_FILTER;
            }
            else{
                state = STREAM_SHELL;
            }
            break;	
    }
}

void mac_addr_filter_v4(
	    hls::stream <eth_axis> & to_shell,
		hls::stream <eth_axis> & to_pr,
        hls::stream <eth_axis> & from_eth, 
        const ap_uint<48> src_mac_addr,	
		const ap_uint<1> debug_bit)

{
#pragma HLS DATAFLOW

#pragma HLS resource core=AXI4Stream variable=to_shell
#pragma HLS resource core=AXI4Stream variable=to_pr
#pragma HLS resource core=AXI4Stream variable=from_eth

#pragma HLS DATA_PACK variable=to_shell
#pragma HLS DATA_PACK variable=to_pr
#pragma HLS DATA_PACK variable=from_eth

#pragma HLS_INTERFACE ap_ctrl_none state_out
#pragma HLS_INTERFACE ap_ctrl_none observedAddress_out 

#pragma HLS INTERFACE ap_ctrl_none port=return

    packet_filtering(
    		from_eth,
			to_shell,
			to_pr,
			src_mac_addr,
			debug_bit);
    
}
