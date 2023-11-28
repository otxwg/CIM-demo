<template>
  <div id="app">
    <router-view v-if="showRouter"></router-view>
  </div>
</template>
<script>
import "../public/static/style.less";
import "../public/static/font/font.css";
import "../public/css/base.css";
export default {
  data() {
    return {
      showRouter: true,
    };
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
};
</script>
<style lang="less">
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  font-family: "MicrosoftYaHei" !important;
}
</style>
