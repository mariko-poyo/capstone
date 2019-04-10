#include "xparameters.h"

//header file for reset ip
#include "auto_reset_10bits.h"
#include "xil_io.h"
#include "source_mac_address_setting.h"
//header file for sysmon interrupt functions
#include "xsysmon.h"

int get_ADC_code();
u32 get_ADC_threshold(u32 decimal_threshold);
void hard_reset();
void set_reset_threshold(u32 threshold);
void set_src_macaddr(unsigned char src_mac_ethernet_address[], unsigned int debug_bit);
void enable_sysmon_tempbus();
