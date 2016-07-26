<script>
    import TopStep from 'COMPONENT/top-step.vue'
    import $ from 'jquery'
    import Vue from 'vue'

    export default{
        components: {
            consignee,
            goods,
            TopStep
        },
        ready() {
            
        },
        data() {
            return {
                orderInfo: "",
                goodsInfo: ""
            }
        },
        methods: {
            invoice(index) {
                this.isNeed = !this.isNeed;
                if (index == 2) {
                    this.isShow = true;
                }
            },
            companyInfo(index) {
                if (index == 2) {
                    this.isShow = true;
                } else {
                    this.isShow = false;
                    this.isNeed = !this.isNeed;
                }
                this.is_invoice = index;
            },
            confirm() {
                if(this.is_invoice == 2 && this.invoice_cmpname == ''){
                    alert('请输入单位名称');
                    return;
                }
                this.isNeed = !this.isNeed;
                this.isShow = false;
            },
            pay() {
                
            }
        }
    }
</script>
<template lang="jade">
div.vconfirm
    header.header
        div.header-left
            a(onclick="history.go(-1)")
                img.ib(src="http://m.mall.snail.com/globalCard/images/head-left.png")
        div.header-title 订单确认
    top-step(:name="['选择行程', '实名认证', '订单确认']", :active="2")
</template>
<style lang="stylus">
@import "confirm.styl"
</style>
