
<template>
  <ag-popup
    title="设置"
    @onCancel="onCancel"
    class="mySettingForm"
    v-model="visible"
  >
    <div>
      <el-form class="login_group" :model="settingForm">
        <el-form-item label="设置天地图影像token" class="modelForm">
          <el-input size="small" v-model="settingForm.ruleForm" autocomplete="off" />
        </el-form-item>
        <div class="expla" style="margin: 3px">注：访问天地图获得token</div>
        <div class="btn-group">
          <el-button size="small"
            type="primary"
            @click="submitForm('settingForm.ruleForm')"
            style="margin: 3px"
            >保存</el-button
          >
        </div>
      </el-form>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/precut/AgPopup.vue";
let widgetConfigHelper = agcim.widgets.widgetConfigHelper;
import config from "./js/config.js";

export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: false,
      settingForm: {
        ruleForm: "8487c77b8410d6c9cd4a22cac7b0d902",
      },
    };
  },
  mounted() {},
  created() {
    let vm = this;
    config.getToken().then(function (data) {
      if(data.success&&data.content.length>0){
        vm.settingForm.ruleForm=data.content[0].value;
      }
    });
  },
  methods: {
    onCancel() {
      this.visible = false;
    },
    submitForm() {
      var storage = [this.settingForm.ruleForm];
      window.localStorage.setItem("BaseLayerSwitcher_tdt_token", storage);
      var s = localStorage.getItem("BaseLayerSwitcher_tdt_token");
      config.setToken(this.settingForm.ruleForm);
      this.visible = false;
      widgetConfigHelper.setItem;
    },
    beforeDestroy() {
      AgPopup.cancel();
      this.$emit("close", { code: "" });
    },
  },
};
</script>
<style scoped>
.mySettingForm {
  width: 360px;
  height: 200px;
  top: 135px;
  left: 620px;
}

.modelForm {
  margin: 5px;
}
.expla {
  color: red;
}
.btn-group {
  text-align: center;
  float: right;
}
</style>
