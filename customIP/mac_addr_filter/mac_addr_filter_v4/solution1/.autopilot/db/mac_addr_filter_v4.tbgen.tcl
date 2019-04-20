set C_TypeInfoList {{ 
"mac_addr_filter_v4" : [[], { "return": [[], "void"]} , [{"ExternC" : 0}], [ {"to_shell": [[], {"reference": "0"}] }, {"to_pr": [[], {"reference": "0"}] }, {"from_eth": [[], {"reference": "0"}] }, {"src_mac_addr": [["const"],"1"] }, {"debug_bit": [["const"],"2"] }],[],""], 
"0": [ "stream<eth_axis>", {"hls_type": {"stream": [[[[],"3"]],"4"]}}], 
"1": [ "ap_uint<48>", {"struct": [[{"pack": 0}],[{"_AP_W":[[], {"scalar": { "int": 48}}]}],[],""]}], 
"3": [ "eth_axis", {"struct": [[],[],[{ "data": [[], "5"]},{ "last": [[], "6"]},{ "tkeep": [[], "7"]}],""]}], 
"5": [ "ap_int<64>", {"hls_type": {"ap_int": [[[[], {"scalar": { "int": 64}}]],""]}}], 
"2": [ "ap_uint<1>", {"struct": [[{"pack": 0}],[{"_AP_W":[[], {"scalar": { "int": 1}}]}],[],""]}], 
"6": [ "ap_uint<1>", {"hls_type": {"ap_uint": [[[[], {"scalar": { "int": 1}}]],""]}}], 
"7": [ "ap_uint<8>", {"hls_type": {"ap_uint": [[[[], {"scalar": { "int": 8}}]],""]}}],
"4": ["hls", ""]
}}
set moduleName mac_addr_filter_v4
set isTaskLevelControl 1
set isCombinational 0
set isDatapathOnly 0
set isPipelined 1
set pipeline_type dataflow
set FunctionProtocol ap_ctrl_none
set isOneStateSeq 0
set ProfileFlag 0
set StallSigGenFlag 0
set isEnableWaveformDebug 1
set C_modelName {mac_addr_filter_v4}
set C_modelType { void 0 }
set C_modelArgList {
	{ to_shell_V int 73 regular {fifo 1 volatile }  }
	{ to_pr_V int 73 regular {fifo 1 volatile }  }
	{ from_eth_V int 73 regular {fifo 0 volatile }  }
	{ src_mac_addr_V int 48 regular  }
	{ debug_bit_V int 1 regular  }
}
set C_modelArgMapList {[ 
	{ "Name" : "to_shell_V", "interface" : "fifo", "bitwidth" : 73, "direction" : "WRITEONLY", "bitSlice":[{"low":0,"up":63,"cElement": [{"cName": "to_shell.V.data.V","cData": "int64","bit_use": { "low": 0,"up": 63},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":64,"up":64,"cElement": [{"cName": "to_shell.V.last.V","cData": "uint1","bit_use": { "low": 0,"up": 0},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":65,"up":72,"cElement": [{"cName": "to_shell.V.tkeep.V","cData": "uint8","bit_use": { "low": 0,"up": 7},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]}]} , 
 	{ "Name" : "to_pr_V", "interface" : "fifo", "bitwidth" : 73, "direction" : "WRITEONLY", "bitSlice":[{"low":0,"up":63,"cElement": [{"cName": "to_pr.V.data.V","cData": "int64","bit_use": { "low": 0,"up": 63},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":64,"up":64,"cElement": [{"cName": "to_pr.V.last.V","cData": "uint1","bit_use": { "low": 0,"up": 0},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":65,"up":72,"cElement": [{"cName": "to_pr.V.tkeep.V","cData": "uint8","bit_use": { "low": 0,"up": 7},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]}]} , 
 	{ "Name" : "from_eth_V", "interface" : "fifo", "bitwidth" : 73, "direction" : "READONLY", "bitSlice":[{"low":0,"up":63,"cElement": [{"cName": "from_eth.V.data.V","cData": "int64","bit_use": { "low": 0,"up": 63},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":64,"up":64,"cElement": [{"cName": "from_eth.V.last.V","cData": "uint1","bit_use": { "low": 0,"up": 0},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]},{"low":65,"up":72,"cElement": [{"cName": "from_eth.V.tkeep.V","cData": "uint8","bit_use": { "low": 0,"up": 7},"cArray": [{"low" : 0,"up" : 0,"step" : 1}]}]}]} , 
 	{ "Name" : "src_mac_addr_V", "interface" : "wire", "bitwidth" : 48, "direction" : "READONLY", "bitSlice":[{"low":0,"up":47,"cElement": [{"cName": "src_mac_addr.V","cData": "uint48","bit_use": { "low": 0,"up": 47},"cArray": [{"low" : 0,"up" : 0,"step" : 0}]}]}]} , 
 	{ "Name" : "debug_bit_V", "interface" : "wire", "bitwidth" : 1, "direction" : "READONLY", "bitSlice":[{"low":0,"up":0,"cElement": [{"cName": "debug_bit.V","cData": "uint1","bit_use": { "low": 0,"up": 0},"cArray": [{"low" : 0,"up" : 0,"step" : 0}]}]}]} ]}
# RTL Port declarations: 
set portNum 13
set portList { 
	{ to_shell_V_din sc_out sc_lv 73 signal 0 } 
	{ to_shell_V_full_n sc_in sc_logic 1 signal 0 } 
	{ to_shell_V_write sc_out sc_logic 1 signal 0 } 
	{ to_pr_V_din sc_out sc_lv 73 signal 1 } 
	{ to_pr_V_full_n sc_in sc_logic 1 signal 1 } 
	{ to_pr_V_write sc_out sc_logic 1 signal 1 } 
	{ from_eth_V_dout sc_in sc_lv 73 signal 2 } 
	{ from_eth_V_empty_n sc_in sc_logic 1 signal 2 } 
	{ from_eth_V_read sc_out sc_logic 1 signal 2 } 
	{ src_mac_addr_V sc_in sc_lv 48 signal 3 } 
	{ debug_bit_V sc_in sc_lv 1 signal 4 } 
	{ ap_clk sc_in sc_logic 1 clock -1 } 
	{ ap_rst sc_in sc_logic 1 reset -1 active_high_sync } 
}
set NewPortList {[ 
	{ "name": "to_shell_V_din", "direction": "out", "datatype": "sc_lv", "bitwidth":73, "type": "signal", "bundle":{"name": "to_shell_V", "role": "din" }} , 
 	{ "name": "to_shell_V_full_n", "direction": "in", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "to_shell_V", "role": "full_n" }} , 
 	{ "name": "to_shell_V_write", "direction": "out", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "to_shell_V", "role": "write" }} , 
 	{ "name": "to_pr_V_din", "direction": "out", "datatype": "sc_lv", "bitwidth":73, "type": "signal", "bundle":{"name": "to_pr_V", "role": "din" }} , 
 	{ "name": "to_pr_V_full_n", "direction": "in", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "to_pr_V", "role": "full_n" }} , 
 	{ "name": "to_pr_V_write", "direction": "out", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "to_pr_V", "role": "write" }} , 
 	{ "name": "from_eth_V_dout", "direction": "in", "datatype": "sc_lv", "bitwidth":73, "type": "signal", "bundle":{"name": "from_eth_V", "role": "dout" }} , 
 	{ "name": "from_eth_V_empty_n", "direction": "in", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "from_eth_V", "role": "empty_n" }} , 
 	{ "name": "from_eth_V_read", "direction": "out", "datatype": "sc_logic", "bitwidth":1, "type": "signal", "bundle":{"name": "from_eth_V", "role": "read" }} , 
 	{ "name": "src_mac_addr_V", "direction": "in", "datatype": "sc_lv", "bitwidth":48, "type": "signal", "bundle":{"name": "src_mac_addr_V", "role": "default" }} , 
 	{ "name": "debug_bit_V", "direction": "in", "datatype": "sc_lv", "bitwidth":1, "type": "signal", "bundle":{"name": "debug_bit_V", "role": "default" }} , 
 	{ "name": "ap_clk", "direction": "in", "datatype": "sc_logic", "bitwidth":1, "type": "clock", "bundle":{"name": "ap_clk", "role": "default" }} , 
 	{ "name": "ap_rst", "direction": "in", "datatype": "sc_logic", "bitwidth":1, "type": "reset", "bundle":{"name": "ap_rst", "role": "default" }}  ]}

set RtlHierarchyInfo {[
	{"ID" : "0", "Level" : "0", "Path" : "`AUTOTB_DUT_INST", "Parent" : "", "Child" : ["1"],
		"CDFG" : "mac_addr_filter_v4",
		"Protocol" : "ap_ctrl_none",
		"ControlExist" : "0", "ap_start" : "0", "ap_ready" : "0", "ap_done" : "0", "ap_continue" : "0", "ap_idle" : "0",
		"Pipeline" : "Dataflow", "UnalignedPipeline" : "0", "RewindPipeline" : "0", "ProcessNetwork" : "1",
		"II" : "0",
		"VariableLatency" : "1", "ExactLatency" : "-1", "EstimateLatencyMin" : "1", "EstimateLatencyMax" : "1",
		"Combinational" : "0",
		"Datapath" : "0",
		"ClockEnable" : "0",
		"HasSubDataflow" : "1",
		"InDataflowNetwork" : "0",
		"HasNonBlockingOperation" : "0",
		"InputProcess" : [
			{"ID" : "1", "Name" : "packet_filtering_U0"}],
		"OutputProcess" : [
			{"ID" : "1", "Name" : "packet_filtering_U0"}],
		"Port" : [
			{"Name" : "to_shell_V", "Type" : "Fifo", "Direction" : "O",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "to_shell_V"}]},
			{"Name" : "to_pr_V", "Type" : "Fifo", "Direction" : "O",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "to_pr_V"}]},
			{"Name" : "from_eth_V", "Type" : "Fifo", "Direction" : "I",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "from_eth_V"}]},
			{"Name" : "src_mac_addr_V", "Type" : "None", "Direction" : "I"},
			{"Name" : "debug_bit_V", "Type" : "None", "Direction" : "I"},
			{"Name" : "state_V", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "state_V"}]},
			{"Name" : "first_packet_org_dat", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "first_packet_org_dat"}]},
			{"Name" : "first_packet_org_las", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "first_packet_org_las"}]},
			{"Name" : "first_packet_org_tke", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "first_packet_org_tke"}]},
			{"Name" : "first_packet_in_data", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "first_packet_in_data"}]},
			{"Name" : "second_packet_org_da", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "second_packet_org_da"}]},
			{"Name" : "second_packet_org_la", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "second_packet_org_la"}]},
			{"Name" : "second_packet_org_tk", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "second_packet_org_tk"}]},
			{"Name" : "app_packet_out_last_s", "Type" : "OVld", "Direction" : "IO",
				"SubConnect" : [
					{"ID" : "1", "SubInstance" : "packet_filtering_U0", "Port" : "app_packet_out_last_s"}]}]},
	{"ID" : "1", "Level" : "1", "Path" : "`AUTOTB_DUT_INST.packet_filtering_U0", "Parent" : "0",
		"CDFG" : "packet_filtering",
		"Protocol" : "ap_ctrl_hs",
		"ControlExist" : "1", "ap_start" : "1", "ap_ready" : "1", "ap_done" : "1", "ap_continue" : "1", "ap_idle" : "1",
		"Pipeline" : "Aligned", "UnalignedPipeline" : "0", "RewindPipeline" : "0", "ProcessNetwork" : "0",
		"II" : "1",
		"VariableLatency" : "0", "ExactLatency" : "1", "EstimateLatencyMin" : "1", "EstimateLatencyMax" : "1",
		"Combinational" : "0",
		"Datapath" : "0",
		"ClockEnable" : "0",
		"HasSubDataflow" : "0",
		"InDataflowNetwork" : "1",
		"HasNonBlockingOperation" : "1",
		"Port" : [
			{"Name" : "from_eth_V", "Type" : "Fifo", "Direction" : "I",
				"BlockSignal" : [
					{"Name" : "from_eth_V_blk_n", "Type" : "RtlSignal"}]},
			{"Name" : "to_shell_V", "Type" : "Fifo", "Direction" : "O",
				"BlockSignal" : [
					{"Name" : "to_shell_V_blk_n", "Type" : "RtlSignal"}]},
			{"Name" : "to_pr_V", "Type" : "Fifo", "Direction" : "O",
				"BlockSignal" : [
					{"Name" : "to_pr_V_blk_n", "Type" : "RtlSignal"}]},
			{"Name" : "src_mac_addr_V", "Type" : "None", "Direction" : "I"},
			{"Name" : "debug_bit_V", "Type" : "None", "Direction" : "I"},
			{"Name" : "state_V", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "first_packet_org_dat", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "first_packet_org_las", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "first_packet_org_tke", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "first_packet_in_data", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "second_packet_org_da", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "second_packet_org_la", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "second_packet_org_tk", "Type" : "OVld", "Direction" : "IO"},
			{"Name" : "app_packet_out_last_s", "Type" : "OVld", "Direction" : "IO"}]}]}


set ArgLastReadFirstWriteLatency {
	mac_addr_filter_v4 {
		to_shell_V {Type O LastRead -1 FirstWrite 1}
		to_pr_V {Type O LastRead -1 FirstWrite 1}
		from_eth_V {Type I LastRead 0 FirstWrite -1}
		src_mac_addr_V {Type I LastRead 0 FirstWrite -1}
		debug_bit_V {Type I LastRead 0 FirstWrite -1}
		state_V {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_dat {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_las {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_tke {Type IO LastRead -1 FirstWrite -1}
		first_packet_in_data {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_da {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_la {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_tk {Type IO LastRead -1 FirstWrite -1}
		app_packet_out_last_s {Type IO LastRead -1 FirstWrite -1}}
	packet_filtering {
		from_eth_V {Type I LastRead 0 FirstWrite -1}
		to_shell_V {Type O LastRead -1 FirstWrite 1}
		to_pr_V {Type O LastRead -1 FirstWrite 1}
		src_mac_addr_V {Type I LastRead 0 FirstWrite -1}
		debug_bit_V {Type I LastRead 0 FirstWrite -1}
		state_V {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_dat {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_las {Type IO LastRead -1 FirstWrite -1}
		first_packet_org_tke {Type IO LastRead -1 FirstWrite -1}
		first_packet_in_data {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_da {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_la {Type IO LastRead -1 FirstWrite -1}
		second_packet_org_tk {Type IO LastRead -1 FirstWrite -1}
		app_packet_out_last_s {Type IO LastRead -1 FirstWrite -1}}}

set hasDtUnsupportedChannel 0

set PerformanceInfo {[
	{"Name" : "Latency", "Min" : "1", "Max" : "1"}
	, {"Name" : "Interval", "Min" : "1", "Max" : "1"}
]}

set PipelineEnableSignalInfo {[
]}

set Spec2ImplPortList { 
	to_shell_V { ap_fifo {  { to_shell_V_din fifo_data 1 73 }  { to_shell_V_full_n fifo_status 0 1 }  { to_shell_V_write fifo_update 1 1 } } }
	to_pr_V { ap_fifo {  { to_pr_V_din fifo_data 1 73 }  { to_pr_V_full_n fifo_status 0 1 }  { to_pr_V_write fifo_update 1 1 } } }
	from_eth_V { ap_fifo {  { from_eth_V_dout fifo_data 0 73 }  { from_eth_V_empty_n fifo_status 0 1 }  { from_eth_V_read fifo_update 1 1 } } }
	src_mac_addr_V { ap_none {  { src_mac_addr_V in_data 0 48 } } }
	debug_bit_V { ap_none {  { debug_bit_V in_data 0 1 } } }
}

set busDeadlockParameterList { 
}

# RTL port scheduling information:
set fifoSchedulingInfoList { 
	to_shell_V { fifo_write 1 no_conditional }
	to_pr_V { fifo_write 1 no_conditional }
	from_eth_V { fifo_read 1 no_conditional }
}

# RTL bus port read request latency information:
set busReadReqLatencyList { 
}

# RTL bus port write response latency information:
set busWriteResLatencyList { 
}

# RTL array port load latency information:
set memoryLoadLatencyList { 
}
