############################################################
## This file is generated automatically by Vivado HLS.
## Please DO NOT edit it.
## Copyright (C) 1986-2018 Xilinx, Inc. All Rights Reserved.
############################################################
open_project mac_addr_filter_v4
set_top mac_addr_filter_v4
add_files mac_addr/mac_adddr_filter_v4.cpp
open_solution "solution1"
set_part {xcku115-flva1517-2-e} -tool vivado
create_clock -period 10 -name default
#source "./mac_addr_filter_v4/solution1/directives.tcl"
#csim_design
csynth_design
#cosim_design
export_design -rtl verilog -format ip_catalog
