<!--
 * @Author: 韩怡婷 448520341@qq.com
 * @Date: 2022-07-28 16:25:36
 * @LastEditors: 刘玲 liuling@augurit.com
 * @LastEditTime: 2023-08-25 17:05:05
 * @FilePath: \agcim-viewer7.21\src\views\components\shell\Instruction.vue
-->
<!-- 说明弹框 -->
<template>
  <ag-popup v-model="visible" :title="this.widgetData.name + '说明'" class="instruction-popup" @onCancel="onCancel">
    <div class="container ag-scrollbar">
      <div class="markdown-css" v-html="dynamicComponent"></div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "../precut/AgPopup.vue";

export default {
  components: {
    "ag-popup": AgPopup,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    widgetData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      articalContent: "",
    };
  },
  mounted() {},
  computed: {
    dynamicComponent() {
      let filename = this.widgetData.funcInvokeUrl;
      let outputString = "";
      if (filename) {
        try {
          const markdown = require("@/widgets/" + filename + "/INSTRUCTION.md");
          const articalContent = marked.parse(markdown);
          outputString = articalContent.replace(/<\/?template>/g, "");
        } catch (error) {
          outputString = "暂无说明";
        }
        return outputString;
      } else {
        return null;
      }
    },
  },
  methods: {
    onCancel() {
      this.$emit("closeInstruction");
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.instruction-popup {
  width: 580px;
  position: fixed;
  left: 40%;
  top: 15%;
  height: 600px;
}
.container {
  height: 540px;
}
.empty-status {
  width: 100%;
  margin: 20px 0;
  color: #fff;
  text-align: center;
}

.markdown-css {
  color: #fff;
  margin: 20px;
  ::v-deep h1,
  ::v-deep h2,
  ::v-deep h3,
  ::v-deep h4,
  ::v-deep h5,
  ::v-deep h6 {
    color: #fff !important;
  }
}
</style>
