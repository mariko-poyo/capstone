// ==============================================================
// RTL generated by Vivado(TM) HLS - High-Level Synthesis from C, C++ and SystemC
// Version: 2018.2
// Copyright (C) 1986-2018 Xilinx, Inc. All Rights Reserved.
// 
// ===========================================================

#ifndef _packet_filtering_HH_
#define _packet_filtering_HH_

#include "systemc.h"
#include "AESL_pkg.h"


namespace ap_rtl {

struct packet_filtering : public sc_module {
    // Port declarations 18
    sc_in_clk ap_clk;
    sc_in< sc_logic > ap_rst;
    sc_in< sc_logic > ap_start;
    sc_out< sc_logic > ap_done;
    sc_in< sc_logic > ap_continue;
    sc_out< sc_logic > ap_idle;
    sc_out< sc_logic > ap_ready;
    sc_in< sc_lv<73> > from_eth_V_dout;
    sc_in< sc_logic > from_eth_V_empty_n;
    sc_out< sc_logic > from_eth_V_read;
    sc_out< sc_lv<73> > to_shell_V_din;
    sc_in< sc_logic > to_shell_V_full_n;
    sc_out< sc_logic > to_shell_V_write;
    sc_out< sc_lv<73> > to_pr_V_din;
    sc_in< sc_logic > to_pr_V_full_n;
    sc_out< sc_logic > to_pr_V_write;
    sc_in< sc_lv<48> > src_mac_addr_V;
    sc_in< sc_lv<1> > debug_bit_V;


    // Module declarations
    packet_filtering(sc_module_name name);
    SC_HAS_PROCESS(packet_filtering);

    ~packet_filtering();

    sc_trace_file* mVcdFile;

    sc_signal< sc_logic > ap_done_reg;
    sc_signal< sc_lv<1> > ap_CS_fsm;
    sc_signal< sc_logic > ap_CS_fsm_pp0_stage0;
    sc_signal< sc_logic > ap_enable_reg_pp0_iter0;
    sc_signal< sc_logic > ap_enable_reg_pp0_iter1;
    sc_signal< sc_logic > ap_idle_pp0;
    sc_signal< sc_lv<4> > state_V_load_load_fu_252_p1;
    sc_signal< sc_lv<1> > grp_nbreadreq_fu_130_p3;
    sc_signal< bool > ap_predicate_op13_read_state1;
    sc_signal< bool > ap_predicate_op29_read_state1;
    sc_signal< bool > ap_predicate_op44_read_state1;
    sc_signal< bool > ap_predicate_op61_read_state1;
    sc_signal< bool > ap_block_state1_pp0_stage0_iter0;
    sc_signal< sc_lv<4> > state_V_load_reg_550;
    sc_signal< sc_lv<1> > tmp_3_reg_566;
    sc_signal< bool > ap_predicate_op89_write_state2;
    sc_signal< sc_lv<1> > tmp_2_reg_570;
    sc_signal< bool > ap_predicate_op94_write_state2;
    sc_signal< bool > ap_block_state2_pp0_stage0_iter1;
    sc_signal< bool > ap_block_pp0_stage0_11001;
    sc_signal< sc_lv<4> > state_V;
    sc_signal< sc_lv<64> > first_packet_org_dat;
    sc_signal< sc_lv<1> > first_packet_org_las;
    sc_signal< sc_lv<8> > first_packet_org_tke;
    sc_signal< sc_lv<64> > first_packet_in_data;
    sc_signal< sc_lv<64> > second_packet_org_da;
    sc_signal< sc_lv<1> > second_packet_org_la;
    sc_signal< sc_lv<8> > second_packet_org_tk;
    sc_signal< sc_lv<1> > app_packet_out_last_s;
    sc_signal< sc_logic > from_eth_V_blk_n;
    sc_signal< bool > ap_block_pp0_stage0;
    sc_signal< sc_logic > to_shell_V_blk_n;
    sc_signal< sc_logic > to_pr_V_blk_n;
    sc_signal< sc_lv<73> > reg_242;
    sc_signal< sc_lv<8> > reg_248;
    sc_signal< sc_lv<1> > tmp_last_V_reg_554;
    sc_signal< sc_lv<1> > tmp_last_V_1_reg_560;
    sc_signal< sc_lv<1> > tmp_1_reg_574;
    sc_signal< sc_lv<64> > lhs_V_1_fu_328_p1;
    sc_signal< sc_lv<64> > lhs_V_1_reg_578;
    sc_signal< sc_lv<1> > tmp_reg_583;
    sc_signal< sc_lv<64> > lhs_V_fu_386_p1;
    sc_signal< sc_lv<64> > lhs_V_reg_587;
    sc_signal< bool > ap_block_pp0_stage0_subdone;
    sc_signal< sc_lv<1> > ap_phi_mux_app_packet_out_last_3_phi_fu_161_p4;
    sc_signal< sc_lv<1> > ap_phi_reg_pp0_iter0_app_packet_out_last_3_reg_158;
    sc_signal< sc_lv<1> > ap_phi_mux_app_packet_out_last_2_phi_fu_170_p4;
    sc_signal< sc_lv<1> > ap_phi_reg_pp0_iter0_app_packet_out_last_2_reg_167;
    sc_signal< bool > ap_block_pp0_stage0_01001;
    sc_signal< sc_lv<73> > tmp_7_fu_488_p4;
    sc_signal< sc_lv<73> > tmp_6_fu_498_p4;
    sc_signal< sc_lv<73> > tmp_37_fu_508_p4;
    sc_signal< sc_lv<73> > tmp_21_fu_518_p4;
    sc_signal< sc_lv<4> > storemerge_cast_cast_fu_276_p3;
    sc_signal< sc_lv<4> > storemerge1_cast_cas_fu_302_p3;
    sc_signal< sc_lv<4> > storemerge3_cast_cas_fu_372_p3;
    sc_signal< sc_lv<64> > x_V_fu_440_p9;
    sc_signal< sc_lv<16> > tmp_20_fu_342_p1;
    sc_signal< sc_lv<8> > tmp_17_fu_338_p1;
    sc_signal< sc_lv<8> > grp_fu_212_p4;
    sc_signal< sc_lv<8> > grp_fu_222_p4;
    sc_signal< sc_lv<8> > grp_fu_232_p4;
    sc_signal< sc_lv<48> > observedAddress_V_fu_346_p6;
    sc_signal< sc_lv<1> > tmp_s_fu_360_p2;
    sc_signal< sc_lv<1> > tmp_22_fu_366_p2;
    sc_signal< sc_lv<8> > tmp_8_fu_396_p1;
    sc_signal< sc_lv<8> > tmp_11_fu_410_p4;
    sc_signal< sc_lv<8> > tmp_14_fu_430_p4;
    sc_signal< sc_lv<8> > tmp_12_fu_420_p4;
    sc_signal< sc_lv<8> > tmp_4_fu_400_p4;
    sc_signal< sc_lv<1> > ap_NS_fsm;
    sc_signal< sc_logic > ap_idle_pp0_0to0;
    sc_signal< sc_logic > ap_reset_idle_pp0;
    sc_signal< sc_logic > ap_enable_pp0;
    sc_signal< bool > ap_condition_451;
    sc_signal< bool > ap_condition_455;
    sc_signal< bool > ap_condition_125;
    sc_signal< bool > ap_condition_234;
    static const sc_logic ap_const_logic_1;
    static const sc_logic ap_const_logic_0;
    static const sc_lv<1> ap_ST_fsm_pp0_stage0;
    static const sc_lv<32> ap_const_lv32_0;
    static const bool ap_const_boolean_1;
    static const sc_lv<4> ap_const_lv4_7;
    static const sc_lv<1> ap_const_lv1_1;
    static const sc_lv<4> ap_const_lv4_4;
    static const sc_lv<4> ap_const_lv4_1;
    static const sc_lv<4> ap_const_lv4_0;
    static const sc_lv<4> ap_const_lv4_6;
    static const sc_lv<4> ap_const_lv4_5;
    static const sc_lv<4> ap_const_lv4_3;
    static const sc_lv<4> ap_const_lv4_2;
    static const bool ap_const_boolean_0;
    static const sc_lv<1> ap_const_lv1_0;
    static const sc_lv<32> ap_const_lv32_40;
    static const sc_lv<32> ap_const_lv32_41;
    static const sc_lv<32> ap_const_lv32_48;
    static const sc_lv<32> ap_const_lv32_8;
    static const sc_lv<32> ap_const_lv32_F;
    static const sc_lv<32> ap_const_lv32_10;
    static const sc_lv<32> ap_const_lv32_17;
    static const sc_lv<32> ap_const_lv32_18;
    static const sc_lv<32> ap_const_lv32_1F;
    static const sc_lv<32> ap_const_lv32_38;
    static const sc_lv<32> ap_const_lv32_3F;
    static const sc_lv<32> ap_const_lv32_20;
    static const sc_lv<32> ap_const_lv32_27;
    static const sc_lv<32> ap_const_lv32_30;
    static const sc_lv<32> ap_const_lv32_37;
    static const sc_lv<32> ap_const_lv32_28;
    static const sc_lv<32> ap_const_lv32_2F;
    // Thread declarations
    void thread_ap_clk_no_reset_();
    void thread_ap_CS_fsm_pp0_stage0();
    void thread_ap_block_pp0_stage0();
    void thread_ap_block_pp0_stage0_01001();
    void thread_ap_block_pp0_stage0_11001();
    void thread_ap_block_pp0_stage0_subdone();
    void thread_ap_block_state1_pp0_stage0_iter0();
    void thread_ap_block_state2_pp0_stage0_iter1();
    void thread_ap_condition_125();
    void thread_ap_condition_234();
    void thread_ap_condition_451();
    void thread_ap_condition_455();
    void thread_ap_done();
    void thread_ap_enable_pp0();
    void thread_ap_enable_reg_pp0_iter0();
    void thread_ap_idle();
    void thread_ap_idle_pp0();
    void thread_ap_idle_pp0_0to0();
    void thread_ap_phi_mux_app_packet_out_last_2_phi_fu_170_p4();
    void thread_ap_phi_mux_app_packet_out_last_3_phi_fu_161_p4();
    void thread_ap_phi_reg_pp0_iter0_app_packet_out_last_2_reg_167();
    void thread_ap_phi_reg_pp0_iter0_app_packet_out_last_3_reg_158();
    void thread_ap_predicate_op13_read_state1();
    void thread_ap_predicate_op29_read_state1();
    void thread_ap_predicate_op44_read_state1();
    void thread_ap_predicate_op61_read_state1();
    void thread_ap_predicate_op89_write_state2();
    void thread_ap_predicate_op94_write_state2();
    void thread_ap_ready();
    void thread_ap_reset_idle_pp0();
    void thread_from_eth_V_blk_n();
    void thread_from_eth_V_read();
    void thread_grp_fu_212_p4();
    void thread_grp_fu_222_p4();
    void thread_grp_fu_232_p4();
    void thread_grp_nbreadreq_fu_130_p3();
    void thread_lhs_V_1_fu_328_p1();
    void thread_lhs_V_fu_386_p1();
    void thread_observedAddress_V_fu_346_p6();
    void thread_state_V_load_load_fu_252_p1();
    void thread_storemerge1_cast_cas_fu_302_p3();
    void thread_storemerge3_cast_cas_fu_372_p3();
    void thread_storemerge_cast_cast_fu_276_p3();
    void thread_tmp_11_fu_410_p4();
    void thread_tmp_12_fu_420_p4();
    void thread_tmp_14_fu_430_p4();
    void thread_tmp_17_fu_338_p1();
    void thread_tmp_20_fu_342_p1();
    void thread_tmp_21_fu_518_p4();
    void thread_tmp_22_fu_366_p2();
    void thread_tmp_37_fu_508_p4();
    void thread_tmp_4_fu_400_p4();
    void thread_tmp_6_fu_498_p4();
    void thread_tmp_7_fu_488_p4();
    void thread_tmp_8_fu_396_p1();
    void thread_tmp_s_fu_360_p2();
    void thread_to_pr_V_blk_n();
    void thread_to_pr_V_din();
    void thread_to_pr_V_write();
    void thread_to_shell_V_blk_n();
    void thread_to_shell_V_din();
    void thread_to_shell_V_write();
    void thread_x_V_fu_440_p9();
    void thread_ap_NS_fsm();
};

}

using namespace ap_rtl;

#endif
