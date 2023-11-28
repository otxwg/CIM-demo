<template>
  <div class="base-page">
    <div :class="[isEmbedAgcloud ? 'embedAgcloudMain' : 'main']">
      <!-- 专题应用 -->
      <component
        v-bind:is="currentTabComponent"
        class="fullscreen-box"
        v-show="!isEmbedAgcloud"
      ></component>
      <LeftMenu
        v-if="isEmbedAgcloud"
        :menuList="catalogueAllInfo"
        @openMainBox="openMainBox"
      ></LeftMenu>
      <ag-map :toolList="toolList" ref="agMap"></ag-map>
    </div>
  </div>
</template>
<script>
import base from "./js/index";
import { resetRouter } from "@/views/js/router/index.js";
import funcList from "./js/funcList.js";
let menuData = null;
export default {
  name: "App",
  components: {
    ...base,
  },
  data() {
    return {
      curFuncObj: {},
      sidebarList: [],
      toolList: [],
      fastnavList: [],
      currentTabComponent: "",
      catalogueAllInfo: funcList, //目录
      menuCode: "",
    };
  },
  created() {},
  mounted() {},
  computed: {
    isEmbedAgcloud() {
      return true;
    },
  },
  watch: {},
  methods: {
    //菜单
    findFuncByUser(dataArray) {
      if (dataArray && dataArray.length > 0) {
        dataArray.forEach((element) => {
          if (element.childrenList) {
            element.childrenList.forEach((item) => {
              let list = item.childrenList;
              if (list) {
                if (item.code === "ag-sidebar") {
                  this.catalogueAllInfo = list;
                  this.addRouters(list);
                } else if (item.code === "ag-toolbox") {
                  this.toolList = list;
                  localStorage.setItem(
                    "toolItem",
                    JSON.stringify(this.toolList)
                  );
                } else if (item.code === "ag-fastnav") {
                  this.fastnavList = list;
                }
              }
            });
          }
        });
      } else {
        this.$message.error("接口超时，刷新浏览器再试试。");
      }
    },
    // 按后台配的数据添加路由
    addRouters(arr) {
      if (this.isEmbedAgcloud) {
        //这里的实现是不完善的，但不想改它，嵌入agcloud时使用更合理的写法即可
        return;
      }
      let vm = this;
      resetRouter();
      for (let i = 0; i < arr.length; i++) {
        let config = arr[i].childrenList;
        if (config) {
          for (let index = 0; index < config.length; index++) {
            let configChildrenList = config[index].childrenList;
            if (configChildrenList) {
              for (let j = 0; j < configChildrenList.length; j++) {
                if (
                  !configChildrenList[j].funcInvokeUrl ||
                  configChildrenList[j].funcInvokeUrl == "/" ||
                  configChildrenList[j].code.indexOf("-fullscreen") > -1
                ) {
                  continue;
                } else {
                  let comp = {
                    path: configChildrenList[j].funcInvokeUrl,
                    name: configChildrenList[j].code,
                    component: () =>
                      import(
                        "../widgets/" +
                          configChildrenList[j].funcInvokeUrl +
                          "/index.vue"
                      ),
                    meta: {
                      keepAlive: true,
                    },
                  };
                  vm.$router.options.routes[0].children.push(comp);
                }
              }
            } else {
              for (let j = 0; j < config.length; j++) {
                if (
                  !config[j].funcInvokeUrl ||
                  config[j].funcInvokeUrl == "/" ||
                  config[j].code.indexOf("-fullscreen") > -1
                ) {
                  continue;
                } else {
                  let comp = {
                    path: config[j].funcInvokeUrl,
                    name: config[j].code,
                    component: () =>
                      import(
                        "../widgets/" + config[j].funcInvokeUrl + "/index.vue"
                      ),
                    meta: {
                      keepAlive: true,
                    },
                  };
                  vm.$router.options.routes[0].children.push(comp);
                }
              }
            }
          }
        }
      }
      vm.$router.addRoutes(vm.$router.options.routes);
    },
    //左边menu 打开当前功能区
    openMainBox(val) {
      if (!this.$store.state.mainBoxState) {
        this.currentTabComponent = "";
        this.$nextTick(() => {
          this.$store.state.mainBoxState = true;
        });
      }

      if (val.code.indexOf("-fullscreen") > -1) {
        this.showFullScreenWidgets(val);
      } else {
        this.$refs.workbench.onShow(val);
        //打开每一项子菜单时都执行此函数，以确定增加子菜单项时clear-icon的位置
        this.$refs.workbench.showClear();
      }
      if (!this.$store.state.mainBoxState) {
        this.$refs.fastnav.list[0].iconClass = "icon-multi2";
      }
    },
    showFullScreenWidgets(val) {
      this.$nextTick(() => {
        this.$store.state.mainBoxState = false;
      });
      this.currentTabComponent =
        require(`@/widgets/${val.funcInvokeUrl}/index.vue`).default;
    },
    //快捷键 工具
    changeToolState(o) {
      this.$refs.agMap.visibleChange(true);
      this.$refs.agMap.changeToolState(o);
    },
    changeCatalogueInfo(info) {
      this.sidebarList = info;
    },
    changeLeftMenu(code) {
      if (this.menuCode == code) return;
      this.menuCode = code;
      if (
        menuData &&
        menuData.length > 0 &&
        menuData[0].childrenList &&
        menuData[0].childrenList.length > 0
      ) {
        let currentMenuItem = menuData[0].childrenList.find((item) => {
          if (item.code == code) return item;
        });
        if (currentMenuItem) {
          this.catalogueAllInfo = currentMenuItem.childrenList;
          this.addRouters(currentMenuItem.childrenList);
        }
      }
    },
  },
};
</script>
<style scoped>
.base-page {
  height: 100%;
  width: 100%;
}
.main {
  position: relative;
  height: calc(100% - 48px);
}
.embedAgcloudMain {
  position: relative;
  height: calc(100%);
}
.right {
  width: 100%;
  height: 100%;
}
#containCesium {
  width: 100%;
  height: 100%;
}
.fullscreen-box {
  position: absolute;
  padding-top: 50px;
  z-index: 4;
  box-sizing: border-box;
}
.main-box {
  position: absolute;
  top: 0;
  left: 200px;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.95);
  /* 暂时隐藏了，这个属性是灰的，应该识别不了这个属性，会影响到全局弹框 */
  /* backdrop-filter: saturate(180%) blur(20px);  */
  opacity: 0.95;
  width: 0;
  height: 100%;
  transition: width 0.25s;
  overflow: hidden;
}
.main-box.active {
  width: 402px;
  /* width: 360px; */
}

::v-deep.cesium-infoBox-title {
  background: #3281e2;
  border-radius: 0;
}

::v-deep.cesium-infoBox {
  right: 5px;
  top: 60px;
  /* width: 400px; */
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #3281e2;
  border-radius: 0;
  z-index: 999;
}

::v-deep button.cesium-infoBox-camera {
  display: none;
}
</style>

<style>
/* ant spin自定义样式 防止高度100%丢失，背景透明度抹除*/
/* .ant-spin-nested-loading {
  height: 100%;
  max-height: 100% !important;
}
.ant-spin-container {
  height: 100%;
}
.ant-spin {
  background-color: #ffffff;
  height: 100%;
}
.ant-spin-nested-loading > div > .ant-spin {
  max-height: 100% !important;
} */
.ant-table-thead > tr > th,
.ant-table-tbody > tr > td {
  background: transparent !important;
}
.ant-dropdown-menu-item,
.ant-dropdown-menu-submenu-title {
  color: #fff !important;
}
.ant-dropdown-menu-item:hover,
.ant-dropdown-menu-submenu-title:hover {
  background-color: #fff !important;
  color: rgba(1, 10, 23, 0.8) !important;
}
.ant-table-placeholder {
  background: transparent !important;
}
</style>
