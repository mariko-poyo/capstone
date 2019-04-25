LWIP server

The current SDK program starts a server program with Mac address = { 0x10, 0x0a, 0x35, 0x00, 0x01, 0x20 } and IP address = 10.1.2.166 & port = 7.
The program will initialize the hardware mac filter such that only packets coming from Mac addr = 0x3e:83:26:a4:00:16 (container machine) can be routed to
microblaze and other packets will go into user space.
Note if this program will be excuted by more than 1 fpgas, it is important to make sure that they have different iP and mac address.

0. The current IP address is self assigned rather than obtained with DHCP.

1. The whole project is less than 1MB in size. The elf is stored in memory location from 0x80000000 to 0x800FFFFF.
   The location is specify in lscript.ld

2. The Macro in code is hardware specific. If ip name in the hardware changes, some macro definition in code may also needs to change

3. Please also version control lscript.ld. It specifies where the elf should be loaded. Currently, the code is stored at mem location 0x80000000 ~ 0x801FFFFF (1MB)

4. Current Memory size is 2GB 0x80000000 ~ 0xFFFFFFFF due to the limitation of 32bit address. 

5. Example of getting temperature:
    volatile char* xadc = (char *)XPAR_SYSMON_0_BASEADDR;
	int ADC_CODE = (*(int*)(xadc + 0x400)) >> 6;
    Refer to page 15 of https://www.xilinx.com/support/documentation/ip_documentation/system_management_wiz/v1_3/pg185-system-management-wiz.pdf
    
    on the server side, temperature needs to be calculated as data_celsius = ADC_CODE * 501.3743 /1024 -273.6777;
    formula is from page 40 of https://www.xilinx.com/support/documentation/user_guides/ug580-ultrascale-sysmon.pdf
    
7. example of immidiate reset:
    /* write value 1 to offset 0 */
    AUTO_RESET_10BITS_mWriteReg(reset_ip, 0x0, 1);
    
 
8. example of setting threshold for auto reset at 60 degree:
    
    /* Instantiate sysmon
	XSysMon_Config *sysmon_config;

	sysmon_config = XSysMon_LookupConfig(XPAR_TEMP_IP_SYSTEM_MANAGEMENT_WIZ_0_DEVICE_ID);
	if (sysmon_config == NULL) {
		return XST_FAILURE;
	}
	XSysMon_CfgInitialize(&SysMonInst, sysmon_config, sysmon_config->BaseAddress);

    
	// enable temperature update from xadc to auto reset IP
	XSysMon_EnableTempUpdate(&SysMonInst);
    
    
    /* convert 60 into hex form */
    temp_threshold = ceil((60 + 273.6777) * 1024 / 501.3743);

    /* write value threshold to offset 4 */
	AUTO_RESET_10BITS_mWriteReg(reset_ip, 0x4, (u32)temp_threshold);
    /* write value 1 to offset 8 to auto reset */
	AUTO_RESET_10BITS_mWriteReg(reset_ip, 0x8, 1);
    
