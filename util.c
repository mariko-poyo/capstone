#include "util.h"

volatile char* SYSMON = (char *)XPAR_SYSMON_0_BASEADDR;
volatile char* RESET_IP = (char *)XPAR_SHELL_I_TEMP_IP_AUTO_RESET_10BITS_0_S00_AXI_BASEADDR;
volatile char* MAC_SETTER = (char*)XPAR_SHELL_I_PACKET_FILTERING_SOURCE_MAC_ADDRESS_S_0_S00_AXI_BASEADDR;

//global driver
XSysMon SysMonInst;

int get_ADC_code(){
	int ADC_CODE = (*(int*)(SYSMON + 0x400)) >> 6;
	return ADC_CODE;
}

u32 get_ADC_threshold(u32 decimal_threshold){
	/* when you actually want to test the functionality
	int temp_threshold = ceil((threshold + 273.6777) * 1024 / 501.3743);
	*/
	u32 ADC_threshold = ((decimal_threshold + 273.6777) * 1024 / 501.3743) + 1;
	return ADC_threshold;
}

void hard_reset(){
	AUTO_RESET_10BITS_mWriteReg(RESET_IP, 0x0, 1);
}

void set_reset_threshold(u32 threshold){
	u32 temp_threshold = get_ADC_threshold(threshold);
	AUTO_RESET_10BITS_mWriteReg(RESET_IP, 0x4, temp_threshold);
	AUTO_RESET_10BITS_mWriteReg(RESET_IP, 0x8, 1);
}
void set_src_macaddr(unsigned char src_mac_ethernet_address[], unsigned int debug_bit){
	unsigned int mac1 =
			(src_mac_ethernet_address[0] << 24)
			+ (src_mac_ethernet_address[1] << 16)
			+ (src_mac_ethernet_address[2] << 8)
			+ (src_mac_ethernet_address[3]);
	unsigned int mac2 =
			(src_mac_ethernet_address[4] << 8)
			+ (src_mac_ethernet_address[5]);
	SOURCE_MAC_ADDRESS_SETTING_mWriteReg(MAC_SETTER, SOURCE_MAC_ADDRESS_SETTING_S00_AXI_SLV_REG1_OFFSET, mac1);
	SOURCE_MAC_ADDRESS_SETTING_mWriteReg(MAC_SETTER, SOURCE_MAC_ADDRESS_SETTING_S00_AXI_SLV_REG2_OFFSET, mac2);
	SOURCE_MAC_ADDRESS_SETTING_mWriteReg(MAC_SETTER, SOURCE_MAC_ADDRESS_SETTING_S00_AXI_SLV_REG3_OFFSET, debug_bit);
	SOURCE_MAC_ADDRESS_SETTING_mWriteReg(MAC_SETTER, SOURCE_MAC_ADDRESS_SETTING_S00_AXI_SLV_REG0_OFFSET, 0x1);
}

void enable_sysmon_tempbus(){
	// Configure sysmon so temperature is output on BUS
	XSysMon_Config *sysmon_config;

	sysmon_config = XSysMon_LookupConfig(XPAR_SHELL_I_TEMP_IP_SYSTEM_MANAGEMENT_WIZ_0_BASEADDR);
	if (sysmon_config == NULL) {
		return XST_FAILURE;
	}
	XSysMon_CfgInitialize(&SysMonInst, sysmon_config, sysmon_config->BaseAddress);

	// enable temp update from xadc
	XSysMon_EnableTempUpdate(&SysMonInst);
}
