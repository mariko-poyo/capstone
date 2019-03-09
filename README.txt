LWIP server

0. Neither Mac address filter nor packet filtering is not setup yet.

0.5. The current IP address is self assigned rather than obtained with DHCP.

1. The whole project is less than 1MB in size. The elf is stored in memory.

2. The Macro in code is hardware specific. If ip name in the hardware changes, some macro definition in code may also needs to change

3. Please also version control lscript.ld. It specifies where the elf should be loaded. Currently, the code is stored at mem location 0x80000000 ~ 0x801FFFFF (1MB)

4. Current Memory size is 2GB 0x80000000 ~ 0xFFFFFFFF due to the limitation of 32bit address. 

5. To write / read memory content, simply write / read to any memory address from 0x80200000 ~ 0xFFFFFFFF. Don't write anything to 0x80000000 ~ 0x801FFFFF because that's where code itself is stored.
    If you don't know how to read/write, refer to 532 tut3 and tut4 :(

6. Example of getting temperature:
    volatile char* xadc = (char *)XPAR_SYSMON_0_BASEADDR;
	int data2 = (*(int*)(xadc + 0x400)) >> 6;
	int data_celsius = data2 * 501.3743 /1024 -273.6777;
    
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
    
ToDo:
    currently reset gets triggered before packet gets sent out to monitor system
    So board dies without any notice to server. Need to see if I can fix this or not.
    