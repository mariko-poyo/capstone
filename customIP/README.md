### Overview 
* auto_reset_10bits_1.0 (IP)
* mac_addr_filter
    * mac_addr_filter_v4 (IP)
    * mac_adddr_filter_v4.cpp (HLS source code)
* source_mac_address_setting_1.0 (IP)

#### auto_reset_10bits_1.0
The module can reset the board internally. It automatically resets the board if the temperature exceeds given threshold.
It also allows user to manually reset the board by setting a reset signal, which is independent of temperature, to be high.
The threshold temperature for auto reset can be manually set through MicroBlaze.
The following table shows registers of auto_reset_10bits_1.0 module, their usage and address.

Address Offset | Register name| Bit | Description
---------------|--------------|-----|------------------------------------------------------------------
0x0000         | slv_reg0     | 0   | manual reset signal. If its LSB is set to 1, board will be reset.
0x0004         | slv_reg1     | 9:0 | temperature threshold for auto reset.
0x0008         | slv_reg2     | 0   | valid bit for setting auto reset threshold value.


#### mac_addr_filter
It contains HLS source code of the mac address filter and the IP itself. 
The MAC address filter module investigates the source MAC address of each packet and forwards the packet to shell only if it
comes from certain address. It forwards the packet to user space (pr region) otherwise.
For debugging purpose, it also has "debug" bit, and all packets will be forwarded to shell if the bit is set to 1.
Since the module itself does not have AXI_Lite port, all user parameters are passed from another module, source_mac_address_setting_1.0.

#### source_mac_address_setting_1.0
It is the module for passing parameter values from MicroBlaze to mac address filter.
The following table shows registers of source_mac_address_setting_1.0 module, their usage and address.

Address Offset | Register name | Bit  | Description
---------------|---------------|------|---------------------------------------------------------------------
0x0000         | slv_reg0      | 0    | valid bit for setting source MAC address value.
0x0004         | slv_reg1      | 31:0 | should be set to lower 32bits(31:0) of target source MAC address.
0x0008         | slv_reg2      | 31:0 | should be set to higher 16bits(47:32) of target source MAC address.
0x000C         | slv_reg3      | 0    | Debug bit 
