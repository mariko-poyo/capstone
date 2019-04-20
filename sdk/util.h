#include "xparameters.h"

//header file for reset ip
#include "auto_reset_10bits.h"
#include "xil_io.h"
#include "source_mac_address_setting.h"
//header file for sysmon interrupt functions
#include "xsysmon.h"

/* This file contains some wrapper function for IPs */

// Get the SYSMON temperature value in ADC code format
int get_ADC_code();

// Take in a celsius Temperature and return the ADC code format temperature
u32 get_ADC_threshold(u32 decimal_threshold);

// Force board to reset directly
void hard_reset();

// Set the reset threshold. The input should be a integer celsius temperature
void set_reset_threshold(u32 threshold);

// Write the src mad address to custom Mac filter IP. 
// If debug bit is 0, only packet with input src_mac_ethernet_address will be
// sent to microblaze and other packets will go into user space
// If debug bit is 1, all packets will go into shell space microblaze
void set_src_macaddr(unsigned char src_mac_ethernet_address[], unsigned int debug_bit);

// This function initialize the SYSMON and enable the 10bit temperature ADC code
// to be output to a 10bit wire which connects to our custom reset IP
void enable_sysmon_tempbus();
