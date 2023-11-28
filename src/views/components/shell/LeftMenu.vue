<!--
 * @lastUpdateBy : 张瀚
 * @description: 左侧的两级菜单，嵌入agcloud版本的
-->
<template>
  <div id="leftMenu" class="">
    <!-- 去除自动填充 -->
    <el-input placeholder="Basic usage" type="password" autoComplete="new-password" style="display: none" />
    <!-- <el-input size="small" placeholder="搜索" v-model="filterName" class="input-with-select searchInput">
      <el-button slot="append" icon="el-icon-search"  @click="onSearch"></el-button>
    </el-input> -->
    <el-input size="small" clearable class="searchInput" placeholder="搜索" prefix-icon="el-icon-search"
      v-model="filterName">
    </el-input>
    <div class="menu ag-scrollbar">
      <div class="innerContent">
        <div v-for="firstMenu in filterMenuList" :key="firstMenu.id" class="menuItem" :class="active ? 'active' : ''">
          <!--一级菜单部分-->
          <div @click="checkFirstMenu(firstMenu.id)" class="firstMenuDiv">
            <p class="firstMenuName">{{ firstMenu.name }}</p>
            <i class="firstMenuArrow" :class="
                idToOpenState[firstMenu.id] == false
                  ? 'el-icon-arrow-down'
                  : 'el-icon-arrow-up'
              "></i>
          </div>
          <!--二级菜单部分-->
          <div class="secondMenuDiv" v-show="idToOpenState[firstMenu.id] != false">
            <div class="secondMenu" v-for="secondMenu in firstMenu.childrenList" :key="secondMenu.id">
              <div class="secondMenuBtn" :class="secondMenu.id == idx ? 'openSecondMenu' : ''"
                @click="checkSecondMenu(secondMenu)">
                <i :class="secondMenu.iconClass"></i>
                <p class="secondMenuName" :title="secondMenu.name">
                  {{ secondMenu.name }}
                </p>
                <div class="sleepTips" v-show="idToState[secondMenu.id] == 2"></div>
              </div>
              <!--每个功能有自己的一个弹窗，互相不影响，但是同一时间只有一个打开，之所以每个功能一个，因为有睡眠功能，不能直接退出-->
              <!--有些功能不满足于弹窗，则应该在这里做一个判断，准备两个不同尺寸的弹窗？或者是由内部传出来尺寸也是可以的-->
              <div class="contentAreaDialog" v-if="
                  [1, 2].includes(idToState[secondMenu.id]) &&
                  !secondMenu.funcInvokeUrl.includes('InternetOfThingsMonitor')
                " v-show="idToState[secondMenu.id] == 1" :class="
                  widgetType[secondMenu.id] == 'agcim-widget-init'
                    ? 'contentAreaDialogNone'
                    : ''
                " :style="getWithStyle(secondMenu, secondMenu.id)">
                <div class="dialogTitle">
                  <p>
                    {{ secondMenu.name }}
                    <i class="el-icon-question funcIcon" @click="openInstruction(secondMenu)"></i>
                  </p>
                  <div class="icon-container">
                    <i class="el-icon-minus funcIcon" @click="keepAlive(secondMenu)"></i>
                    <i class="el-icon-close funcIcon" @click="closeMenu(secondMenu)"></i>
                  </div>
                </div>
                <div class="dialogContain ag-scrollbar">
                  <keep-alive>
                    <component v-bind:is="urlToView[secondMenu.funcInvokeUrl]" :widgetData="secondMenu"
                      @close="closeMenu(secondMenu)"></component>
                  </keep-alive>
                </div>
              </div>
              <!-- 临时暴力改，物联网数据检测微件不需要默认弹框 -->
              <div v-if="
                  [1, 2].includes(idToState[secondMenu.id]) &&
                  ['page2','page4','page5'].includes(secondMenu.funcInvokeUrl)
                " v-show="idToState[secondMenu.id] == 1">
                <keep-alive>
                  <component v-bind:is="urlToView[secondMenu.funcInvokeUrl]" :widgetData="secondMenu"
                    @close="closeMenu(secondMenu)" @hidden="changeState(secondMenu, 2)"
                    @show="changeState(secondMenu, 1)"></component>
                </keep-alive>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <instruction :visible="instructionVisible" @closeInstruction="closeInstruction" :widgetData="widgetData">
    </instruction>
  </div>
</template>
<script>
  //图标文件定义
  import "../../../../public/static/icon.css";
  //iconfont字体图标
  import "../../../../public/css/iconfont/iconfont.css";
  import Instruction from "./Instruction";
  import qs from "qs";
  export default {
    components: { instruction: Instruction },
    props: {
      //菜单列表
      menuList: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        //一级菜单id对应打开状态,显性为false则关,否则开
        idToOpenState: {},
        //二级菜单对应其状态，(0或者undefined)关闭1打开2睡眠（隐藏但未退出）
        idToState: {},
        //功能地址对应组件
        urlToView: {},
        //搜索过滤的名字，用来过滤二级菜单的
        filterName: "",
        //二级菜单当前选中的id
        idx: null,
        //选中class
        active: false,
        widgetType: {},
        containerWidth: {}, //微件内容区宽度
        readme: "",
        instructionVisible: false,
        widgetData: {},
      };
    },
    created() { },
    mounted() {
      window.debugPage = this;
      if (localStorage.idToOpenState) {
        this.idToOpenState = JSON.parse(localStorage.getItem("idToOpenState"));
      }
    },
    destroyed() { },
    computed: {
      filterMenuList() {
        //根据过滤条件过滤掉名字不匹配的二级菜单
        if (this.filterName == undefined || this.filterName.length == 0) {
          this.active = false;
          return this.menuList;
        } else {
          this.active = true;
          return JSON.parse(JSON.stringify(this.menuList))
            .filter((first) => {
              //没有下一级的就是空的，空的肯定要过滤掉
              if (first.childrenList) {
                first.childrenList = first.childrenList.filter((item) =>
                  item.name.includes(this.filterName)
                );
              }
              if (
                first.childrenList == undefined ||
                first.childrenList.length == 0
              ) {
                return undefined;
              }
              return first;
            })
            .filter((item) => item != undefined);
        }
      },
      getViewByUrl() {
        return (url) => import(`@/widgets/${url}/index.vue`);
      },
    },
    watch: {},
    methods: {
      /**
       * @lastUpdateBy : 韩怡婷
       * @description: 获取组件width
       * @param {*}
       * @return {*}
       */
      getWithStyle(item, id) {
        this.containerWidth[id] = 360;
        if (item.funcInvokeUrl == "ControlHeightAnalysis") {
          this.containerWidth[id] = 580;
        }
        if (item.funcInvokeUrl == "GeologyAnalysis") {
          this.containerWidth[id] = 430;
        }
        if (item.funcInvokeUrl == "SubmergingAnalysis") {
          this.containerWidth[id] = 430;
        }
        if (item.funcInvokeUrl == "FixedPointObservation") {
          this.containerWidth[id] = 370;
        }
        if (item.funcInvokeUrl == "Demo_VideoStickers") {
          this.containerWidth[id] = 120;
        }
        if (item.widgetType == "agcim-widget-init") {
          this.containerWidth[id] = 0;
        }
        return "width:" + this.containerWidth[id] + "px";
      },
      /**
       * @lastUpdateBy : 韩怡婷
       * @description: 最小化(进入睡眠状态)
       * @param {*}
       * @return {*}
       */
      keepAlive(menu) {
        //打开状态，进入睡眠状态
        this.$set(this.idToState, menu.id, 2);
        this.idx = null;
      },
      /**
       * @lastUpdateBy : 张瀚
       * @description: 选中一级菜单
       */
      checkFirstMenu(menuId) {
        if (this.idToOpenState[menuId] == false) {
          this.$set(this.idToOpenState, menuId, true);
          localStorage.setItem(
            "idToOpenState",
            JSON.stringify(this.idToOpenState)
          );
          return;
        }
        this.$set(this.idToOpenState, menuId, false);
        localStorage.setItem("idToOpenState", JSON.stringify(this.idToOpenState));
      },
      /**
       * @lastUpdateBy : 张瀚
       * @description: 选中二级菜单
       */
      checkSecondMenu(menu) {
        //判断状态
        switch (this.idToState[menu.id]) {
          case 0:
          case undefined:
          case 2:
            //其他已经打开的都进入睡眠状态
            for (let id in this.idToState) {
              if (id != menu.id && this.idToState[id] == 1) {
                this.$set(this.idToState, id, 2);
              }
            }
            this.openFunc(menu);
            this.idx = menu.id;
            break;
          case 1:
            //打开状态，进入睡眠状态
            this.keepAlive(menu);
            break;
        }
      },
      /**
       * @lastUpdateBy : 张瀚
       * @description: 关闭打开的二级菜单
       */
      closeMenu(menu) {
        this.$set(this.idToState, menu.id, 0);
        this.idx = null;
      },
      changeState(menu, state) {
        if (this.idToState[menu.id] === state) return;
        this.$set(this.idToState, menu.id, state);
      },
      /**
       * @lastUpdateBy : 张瀚
       * @description: 按需加载指定的功能
       */
      openFunc(menu) {
        if (menu.widgetType == "agcim-third-part" && menu.funcInvokeUrl) {
          window.open(menu.funcInvokeUrl, "_blank"); // 第三方跳转
        } else {
          //视点跳转
          if (this.urlToView[menu.funcInvokeUrl] == undefined) {
            //当微件类型为工具栏微件时，不弹出左侧的工作区栏
            if (menu.widgetType == "agcim-widget-init") {
              this.$set(this.widgetType, menu.id, "agcim-widget-init");
            }
            this.getViewByUrl(menu.funcInvokeUrl)
              .then(() => {
                this.$set(this.urlToView, menu.funcInvokeUrl, () =>
                  this.getViewByUrl(menu.funcInvokeUrl)
                );
                //打开选中的功能
                this.$set(this.idToState, menu.id, 1);
              })
              .catch((e) => {
                this.$message.error(`找不到指定的功能！`);
                console.error(e);
              });
            return;
          }
          //打开选中的功能
          this.$set(this.idToState, menu.id, 1);
        }
      },
      onSearch(a) {
        console.log(a);
      },
      // 打开说明弹框
      openInstruction(menu) {
        console.log("打开 ~", menu);
        this.widgetData = menu;
        this.instructionVisible = true;
      },
      closeInstruction() {
        this.instructionVisible = false;
      },
    },
  };
</script>
<style lang="scss" scoped>
  .ag-scrollbar {
    height: auto;
    overflow-y: auto;
    overflow-x: hidden; //为了自定义滚动条不占用容器宽度 内部设置一个div超出了容器的width
  }

  /*滚动条整体样式*/
  .ag-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 10px;
    border-radius: 5px;
    /* background: linear-gradient(0deg, #1890ff, rgba(255, 255, 255, 0.9), #1890ff); */
    background: #79797933;
  }

  /* 轨道 */
  .ag-scrollbar::-webkit-scrollbar-track {
    /* box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3); */
    border-radius: 5px;
  }

  /* 滑块 */
  .ag-scrollbar::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
  }

  #leftMenu {
    left: 0px;
    width: 180px;
  }

  .searchInput {
    width: 100%;
    margin-top: 15px;
    padding: 0 11px;
    box-sizing: border-box;
    position: absolute;
    top: 0;

    ::v-deep .el-input__inner {
      color: white !important;
      background: none !important;
      border: 1px solid #595e67;
      border-radius: 20px;
      padding-left: 20px;
      height: 29px;
      line-height: 29px;
    }

    ::v-deep .el-input__prefix {
      right: 20px;
      left: auto;
    }

    ::v-deep .el-input__suffix {
      right: 40px;
      left: auto;
    }

    ::v-deep .ant-input-search-icon,
    ::v-deep .ant-input-clear-icon,
    ::v-deep .ant-input-clear-icon:hover,
    ::v-deep .ant-input-search-icon:hover {
      color: #ffffff;
      opacity: 0.6;
      margin-right: 8px;
    }
  }

  // 两个弹窗的位置
  #leftMenu {
    position: fixed;
    top: 0px;
    height: calc(100% - 0px);
    background: rgba(1, 10, 23, 0.8);
    /* // opacity: 0.8; */
    z-index: 100;
    /* border-radius: 10px; */
    user-select: none;
    font-family: "MicrosoftYaHei";

  }

  .contentAreaDialog {

    position: fixed;
    top: 0px;
    height: calc(100% - 0px);
    background: rgba(1, 10, 23, 0.8);
    /* // opacity: 0.8; */
    z-index: 100;
    /* border-radius: 10px; */
    user-select: none;
    font-family: "MicrosoftYaHei";
    left: 200px;
    width: 360px;
    cursor: default;
    height: calc(100% - 124px);
    top: 64px;
    border-radius: 4px;
  }

  .menuItem {
    padding: 10px 11px;
    color: #fff;

    .firstMenuDiv {
      border-bottom: 1px solid #919499;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .firstMenuName {
        line-height: 28px;
        color: #ffffff;
        font-weight: 400;
        opacity: 0.6;
      }

      .firstMenuArrow {
        color: #ffffff;
        opacity: 0.6;
      }
    }

    .secondMenuDiv {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-flow: wrap;
      padding: 0 6px;

      .secondMenu {
        .secondMenuBtn {
          width: 66px;
          height: 66px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgb(255 255 255 / 10%);
          border-radius: 10px;
          margin-top: 14px;
          cursor: pointer;
          position: relative;

          >i {
            width: auto;
            height: auto;
            font-size: 30px;
            line-height: 30px;
            margin-top: 6px;
            color: #fff;
            opacity: 0.6;
          }

          .secondMenuName {
            line-height: 28px;
            width: 100%;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            opacity: 0.6;
            font-size: 12px;
          }
        }

        &.checked {
          background: rgb(37 143 234);
        }

        .contentAreaDialog {
          left: 200px;
          width: 360px;
          cursor: default;

          .dialogTitle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            //  width: 100%;
            height: 40px;
            border-bottom: 1px solid #919499;
            padding: 10px;

            .funcIcon {
              cursor: pointer;
              padding: 5px;
            }
          }

          .dialogContain {
            width: 100%;
            height: calc(100% - 40px);
            overflow-x: hidden;
            overflow-y: auto;

            >div {
              padding: 14px;
            }

            ::v-deep .title {
              color: #ffffff;
              font-weight: normal;
              font-size: 14px;
            }
          }
        }

        .contentAreaDialogNone {
          width: 0;
          overflow: hidden;
        }

        .sleepTips {
          width: 10px;
          height: 10px;
          background: #0081ff;
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          position: absolute;
          right: 5px;
          top: 5px;
        }
      }
    }

    .secondMenu .openSecondMenu.secondMenuBtn {
      background: #1e90ff !important;

      >i {
        color: #ffffff !important;
        opacity: 1;
      }

      >.secondMenuName {
        opacity: 1;
      }
    }
  }

  .active .secondMenuBtn {
    background: rgba(255, 202, 58, 0.5) !important;
    color: #ffffff;
  }

  #leftMenu .innerContent {
    width: 180px;
  }

  .searchInput ::v-deep .ant-input-search-icon {
    height: 16px;
    width: 16px;
    background-size: 100%;
  }

  .searchInput ::v-deep .ant-input-search-icon svg {
    display: none !important;
  }

  .menu {
    margin-top: 48px;
    height: calc(100% - 69px);
  }

  //字体颜色
  .contentAreaDialog ::v-deep {

    .ant-form,
    .ant-form-item,
    .ant-form-item-label>label,
    .ant-radio-wrapper,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    .ant-table-thead>tr>th,
    .ant-tabs,
    .ant-table,
    .ant-empty-description,
    .ant-progress-text {
      color: #fff !important;
    }

    .bottom-description {
      background-color: none;
    }

    .legend_panel {
      background-color: none;
      color: #ffffff;
    }

    .ant-card {
      background: none;
      color: #ffffff;
    }

    .ant-card-bordered {
      background: none;
      color: #ffffff;
    }

    .ant-table-thead>tr>th {
      background: none;
      color: #ffffff;
    }

    .ant-table-thead>tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td,
    .contentAreaDialog .ant-table-tbody>tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td,
    .ant-table-thead>tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td,
    .ant-table-tbody>tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)>td {
      background: rgba(255, 255, 255, 0.3);
    }

    .el-button--small {
      font-size: 14px;
      min-width: 88px;
      height: 32px;
    }

    .ant-table-small {
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .ant-table-empty {}

    .ant-table-small.ant-table-bordered .ant-table-content {
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .ant-table-content {
      border: 1px solid rgba(255, 255, 255, 0.3);

      .ant-table-thead {
        background-color: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        height: 44px;

        >tr th {
          border-bottom: 0 !important;
        }
      }

      .ant-table-body {
        margin: 0;

        .ant-table-row {
          td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          }
        }
      }
    }

    .ant-table-small>.ant-table-content .ant-table-row:last-child td {
      border-bottom: 0;
    }

    .ant-table-bordered .ant-table-tbody>tr>td,
    .ant-table-bordered .ant-table-thead>tr>th {
      border-right: 0;
    }

    // 清除按钮
    .clearcss {
      color: #fff;
      background: rgba(0, 0, 0, 0);
    }

    .clearcss.el-button.is-plain:focus,
    .clearcss.el-button.is-plain:hover {
      background: none;
    }

    .ant-switch {
      background-color: #ffffff;
      min-width: 48px !important;
    }

    .ant-switch-checked {
      background-color: #1890ff;
    }

    .ag-pop-box-unique {
      top: 128px;
    }

    .ant-table-placeholder {
      border: none;
      color: #fff;
    }
  }

  // .ant-form,
  // .contentAreaDialog ::v-deep .ant-form-item,
  // .contentAreaDialog ::v-deep .ant-form-item-label > label,
  // .ant-radio-wrapper,h1, h2, h3, h4, h5, h6 {
  //   color: #fff !important;
  // }
</style>