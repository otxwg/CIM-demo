<template>
  <div class="main" @contextmenu="rightClick" @mousedown="mouseDown">
    <div class="map">
      <div id="containCesium"></div>
    </div>
  </div>
</template>
<script>
import { MapInit } from "./js/index";

let tApps = {};
let wApps = {};
export default {
  name: "ag-map",
  components: {},
  props: {
    toolList: { type: Array },
    // mapWdList: { type: Array }, //可后台配 , 现在是本地手动配
  },
  data() {
    return {
      //当前打开的工具
      curToolList: [],
      //当前打开的工具，需要在地图之外
      curToolList1: [],
      //地图上的微件，可默认，可调用时开启
      curMapWdList: [],
      engine: "ag-sidebar",
      isShowRight: false,
      rightObject: {
        top: 0,
        left: 0,
      },
      isTeleport: false,
    };
  },
  beforeMount() {},
  mounted() {
    this.initMap();
  },
  methods: {
    changeProgress(value) {
      this.engine = value;
    },
    initMap: function () {
      let _t = this;
      MapInit.creatMap("containCesium", [], null, this);
      
    },
    changeWidget(o) {
      if (!o.funcInvokeUrl) {
        o.funcInvokeUrl = o.code;
      }
      let vm = this;
      for (let i = 0; i < vm.curMapWdList.length; i++) {
        if (vm.curMapWdList[i].funcInvokeUrl === o.funcInvokeUrl) {
          return vm.$refs[o.funcInvokeUrl][0].onShow(o);
        }
      }
      if (!o.app) {
        let newO = {
          code: o.funcInvokeUrl,
          app: wApps[o.funcInvokeUrl],
        };
        vm.curMapWdList.push(newO);
      }
      vm.$nextTick(() => {
        vm.$refs[o.funcInvokeUrl][0].onShow(o);
      });
    },

    //打开工具
    changeToolState(o) {
      if (!o.funcInvokeUrl) {
        o.funcInvokeUrl = o.code;
      }
      for (let i = 0; i < this.curToolList.length; i++) {
        //属性 不关闭
        // if (o.funcInvokeUrl == "AttributeEnquiry") {
        //   return;
        // } else
        if (this.curToolList[i].funcInvokeUrl === o.funcInvokeUrl) {
          //去掉打开状态
          for (let j = 0; j < this.toolList.length; j++) {
            //去掉属性的工具的判断
            if (this.toolList[j].funcInvokeUrl === o.funcInvokeUrl) {
              this.toolList[j].visiable = false;
              continue;
            }
          }
          return this.curToolList.splice(i, 1);
        }
      }

      for (let i = 0; i < this.curToolList1.length; i++) {
        if (this.curToolList1[i].funcInvokeUrl === o.funcInvokeUrl) {
          //去掉打开状态
          for (let j = 0; j < this.toolList.length; j++) {
            //去掉属性的工具的判断
            if (this.toolList[j].funcInvokeUrl === o.funcInvokeUrl) {
              this.toolList[j].visiable = false;
              continue;
            }
          }
          if (o.funcInvokeUrl == "MultiScreenLinkage") {
            //可待某个字段区分
            document.getElementById("fastNav").style.right = "585px";
          }
          return this.curToolList1.splice(i, 1);
        }
      }

      if (!o.app) {
        if (!tApps[o.funcInvokeUrl]) {
          debugger
          try {
            tApps[o.funcInvokeUrl] =
              require(`@/widgets/${o.funcInvokeUrl}/index.vue`).default;
          } catch (e) {
            this.$message.error(`找不到指定的功能！`);
            console.error(e);
          }
        }
        o.app = tApps[o.funcInvokeUrl];
      }
      this.curToolList.push(o);
    },
    isEmptyObject(e) {
      for (let t in e) return !1;
      return !0;
    },
    // 鼠标右击，打开弹窗
    rightClick(e) {
      if (
        e.clientY != this.mouseDownSite.clientY ||
        e.clientX != this.mouseDownSite.clientX
      )
        return;
      this.isShowRight = true;
      this.rightObject = {
        top: e.clientY,
        left: e.clientX,
      };
    },
    // 鼠标按下位置
    mouseDown(e) {
      this.mouseDownSite = {
        clientY: e.clientY,
        clientX: e.clientX,
      };
    },
  },
};
</script>
<style scoped>
.main {
  width: 100%;
  height: 100%;
}
.map {
  position: relative;
  display: flex;
  height: 100%;
}
.map #containCesium {
  position: relative;
  height: 100%;
  width: 100%;
  /* flex: 1; */
}
/* .map > div {
   flex: 1;
  height: 100%;
} */
.map /deep/ .cesium-viewer-toolbar {
  top: 76px;
  right: 460px;
}
.map /deep/ .cesium-viewer-geocoderContainer {
  display: none !important;
}

.map /deep/ .cesium-viewer-geocoderContainer .cesium-geocoder-searchButton {
  width: 46px;
  height: 46px;
  background-color: rgba(1, 10, 23, 0.8);
}

.map /deep/ .cesium-geocoder-input {
  height: 46px;
  padding: 0 46px 0 0;
}

.map /deep/ .cesium-svgPath-svg {
  width: 26px;
  height: 26px;
  margin: 10px;
}

.slider {
  display: none;
  left: 50%;
  position: absolute;
  top: 0;
  z-index: 999;
  width: 8px;
  height: 100%;
  border-radius: 0 3px 3px 0px;
  background: rgb(81, 61, 192);
  z-index: 99;
  -webkit-user-select: none;
  user-select: none;
}
</style>
