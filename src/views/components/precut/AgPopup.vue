<template>
  <div class="ag-pop-box-unique" :class="{ agpopBoxHide: !value,isFullscreen:isFullscreen }"  ref="box">
    <div class="ag-pop-box-unique-head" @mousedown="mousedown">
      <span>{{ title }}</span>
      <i v-if="fullscreen && !isFullscreen" class="icon-Maximize-1" @click="showFullscreen"></i>
      <i v-if="fullscreen && isFullscreen" class="icon-Maximize-3" @click="showFullscreen"></i>
      <i class="icon-close" @click="onCancel"></i>
    </div>
    <div class="ag-pop-box-body">
      <div v-if="backgroundImageUrl" class="ag-image" :style="{backgroundImage:'url('+backgroundImageUrl+')',height:imageHeight}"></div>
      <slot></slot>
    </div>
    <div class="ag-pop-box-unique-foot">
      <el-button size="mini" v-if="confirm" type="primary" @click="onConfirm">
        {{ confirmVal }}
      </el-button>
      <el-button size="mini" v-if="cancel" @click="onCancel">{{
        cancelVal
      }}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "AgPopup",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    confirm: {
      type: Boolean,
      default: false,
    },
    cancel: {
      type: Boolean,
      default: false,
    },
    title: {
      default: null,
    },
    confirmVal: {
      type: String,
      default: "是",
    },
    cancelVal: {
      type: String,
      default: "否",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    maskHide: {
      type: Boolean,
      default: true,
    },
    isMove: {
      type: Boolean,
      default: true,
    },
    fullscreen:{
       type: Boolean,
      default: false,
    },
    isFullscreen:{
      type: Boolean,
      default: false,
    },
    backgroundImageUrl:{
      type:String,
      default:""
    },
    imageHeight:{
      type:String,
      default:"455px"
    },
    removable:{
      type: Boolean,
      default: true
    }
  },
  methods: {
    showFullscreen(){
      this.isFullscreen = !this.isFullscreen
      if(!this.isFullscreen){
        this.imageHeight ="455px"
      }else{
        this.imageHeight = document.body.clientHeight+"px"
      }
    },

    maskHandle() {
      if (this.maskHide) {
      }
    },
    onConfirm() {
      if (!this.isDisabled) {
        this.$emit("onConfirm");
      }
    },
    onCancel(e) {
      this.$emit("onCancel");
    },
    mousedown(event) {
      if(!this.removable){
        return 0;
      }
      this.selectElement = this.$refs.box;
      var dom = this.selectElement;
      this.selectElement.style.cursor = "move";
      this.isDowm = true;
      var distanceX = event.clientX - this.selectElement.offsetLeft;
      var distanceY = event.clientY - this.selectElement.offsetTop;
      if (this.isMove) {
        document.onmousemove = function (ev) {
          var oevent = ev || event;
          dom.style.left = oevent.clientX - distanceX + "px";
          dom.style.top = oevent.clientY - distanceY + "px";
        };
      }

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
        dom.style.cursor = "default";
      };
    },
  },
};
</script>
<style scoped lang="scss">
.ag-image {
  background-size: cover;   
  background-repeat: no-repeat;  
}
.ag-pop-box-unique {
  position: fixed;
  z-index: 12;
  top: 512px;
  right: 16px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(1, 10, 23, 0.8);
  min-width: 250px;
}
.agpopBoxHide {
  display: none;
}
.ag-pop-box-unique-head {
  position: relative;
  font-size: 16px;
  height: 40px;
  vertical-align: middle;
  justify-items: center;
  line-height: 40px;
  font-weight: bold;
  background: none;
  color: #ffffff;
  text-indent: 20px;
  border-bottom: 1px solid #919499;
}

.ag-pop-box-unique-head .ag-pop-box-unique-close {
  position: absolute;
  top: calc(50% - 9px);
  right: 20px;
  font-size: 15px;
  cursor: pointer;
}
.ag-pop-box-unique-foot {
  text-align: right;
  margin-right: 5px;
}
.ag-pop-box-unique-foot button {
  margin: 10px 5px;
}
.ag-pop-box-unique.isFullscreen{
  left: 0 !important;
  top:0 !important;
  width: 100% !important;
  height: 100%;

}
.ag-pop-box-unique-head i{
  margin-top: 10px;
  position: absolute;
  height: 16px;
  width: 16px;
  background-size: 100%;
}
.icon-Maximize-1 {
  background: url(../../img/Maximize-1.png) no-repeat;
  right: 50px;
}
.icon-Maximize-3 {
  background: url(../../img/Maximize-3.png) no-repeat;
  right: 50px;
}
.icon-close {
  background: url(../../img/close.png) no-repeat;
  right: 20px;
}
// /*弹层动画（放大）*/

// .popIn {
//     -webkit-animation: popIn .4s;
//     animation: popIn .4s;
//     -webkit-animation-name: popIn;
//     animation-name: popIn;
// }

@-webkit-keyframes popIn {
    0% {
        -webkit-transform: scale3d(0, 0, 0);
        transform: scale3d(0.5, 0.5, 0.5);
        opacity: 0;
    }
    50% {
        -webkit-animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
        animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
    }
    100% {
        -webkit-transform: scale3d(1, 1, 1);
        transform: scale3d(1, 1, 1);
        -webkit-animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
    }
}

@keyframes popIn {
    0% {
        -webkit-transform: scale3d(0, 0, 0);
        transform: scale3d(0.5, 0.5, 0.5);
        opacity: 0;
    }
    50% {
        -webkit-animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
        animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
    }
    100% {
        -webkit-transform: scale3d(1, 1, 1);
        transform: scale3d(1, 1, 1);
        -webkit-animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
    }
}
</style>
