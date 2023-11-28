import Vue from "vue";
import router from "./views/js/router";
import App from "./App.vue";

Vue.config.productionTip = false;

//部分引入element
import "element-ui/lib/theme-chalk/index.css";

import ElementUI from "element-ui";

Vue.use(ElementUI);

Vue.prototype.$bus = new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
