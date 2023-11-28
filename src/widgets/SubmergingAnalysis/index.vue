<!--
 *  
 * @description: 文件描述 淹没模拟
-->

<template>
  <div class="container">
    <ul class="parameter-container">
      <li>
        <div class="title">
          <i class="decoration"></i>
          <h5>绘制分析范围</h5>
        </div>
        <el-button size="small" type="primary" @click="draw('addPoint')" :disabled="isLineDraw">折线绘制</el-button>
      </li>
      <li>
        <div class="title">
          <i class="decoration"></i>
          <h5>设置参数</h5>
        </div>
      </li>
      <li>
        <p class="parameter-sty" style="width: 72px">模拟速度</p>
        <el-radio-group v-model="value" defaultChecked="1">
          <el-radio :label="1">慢</el-radio>
          <el-radio :label="2">中</el-radio>
          <el-radio :label="3">快</el-radio>
        </el-radio-group>
      </li>
      <li class="parameter-water">
        <p style="width: 94px">警戒水位(m)</p>
        <el-input-number size="small" :min="0" :precision="0" v-model="alertHeight" type="number"
          style="width: 130px" />
      </li>
      <li class="parameter-water">
        <div>
          <p>超警戒水位(m)：{{ overAlertHeight }}</p>
        </div>
      </li>

      <li class="parameter-water">
        <p>单位时间降雨量(mm)</p>
        <el-input-number size="small" :min="1" :precision="0" class="parameter-input" v-model="rainfallSpeed"
          type="number" />
      </li>
      <li class="parameter-water">
        <p>单位时间渗透量(mm)</p>
        <el-input-number size="small" :min="0" :precision="0" class="parameter-input" v-model="penetrationSpeed"
          type="number" />
      </li>
      <li class="parameter-water">
        <p>最终淹没高度(m)</p>
        <el-input-number size="small" :precision="3" :min="startHeight" :max="defaultEndHeight"
          :defaultValue="defaultEndHeight" class="parameter-input" :disabled="isStart" v-model="endHeight"
          type="number" />
      </li>
      <li class="parameter-water">
        <p>预警水位高度(m)</p>
        <el-input-number size="small" :precision="3" :defaultValue="startHeight" :min="startHeight" :max="endHeight"
          class="parameter-input" :disabled="isStart" v-model="alertHeight" type="number" />
      </li>
      <li>
        <p class="parameter-sty">水体颜色</p>
        <el-input size="small" @change="updateWaterColor" type="color" v-model="waterColor"
          style="width: 130px; margin-left: 126px" />
      </li>
      <li>
        <div class="title">
          <i class="decoration"></i>
          <h5>分析模拟</h5>
        </div>
        <div class="analysis-container">
          <p class="parameter-sty" style="width: 72px">雨水动画</p>
          <el-radio-group @change="rainSwitcher" v-model="offRain" defaultChecked="true">
            <el-radio :label="true">开</el-radio>
            <el-radio :label="false">关</el-radio>
          </el-radio-group>
        </div>
        <div class="analysis-container">
          <el-button size="small" class="analysis-btn" style="margin-left: 23px" :type="
              simulationBtnTypeIndex == 0 || simulationBtnTypeIndex == 2
                ? 'primary'
                : 'danger'
            " :disabled="!points" @click="simulationBtnEvent">
            {{
            simulationBtnTypes[
            simulationBtnTypeIndex > simulationBtnTypes.length - 1
            ? simulationBtnTypes.length - 1
            : simulationBtnTypeIndex
            ]
            }}
          </el-button>
          <el-button size="small" class="clear-btn" @click="clear">清除</el-button>
        </div>
      </li>
      <li>
        <div class="item">
          <span class="label">当前水位(m)</span>
          <el-slider class="slider" @change="sliderEncent" v-model="height" :min="0" :max="100" :step="0.01" />
          <el-input-number size="small" style="width: 120px; margin-left: 6px" v-model="height" @change="sliderEncent"
            :min="0" :max="100" :step="0.01" />
        </div>
      </li>
      <li class="water-info">
        <div>
          <p>区域面积：</p>
          <p>{{ totalArea }} m²</p>
        </div>
        <div>
          <p>淹没面积：</p>
          <p>{{ floodedArea }} m²</p>
        </div>
        <div>
          <p>淹没比例：{{ floodProportion }} %</p>
        </div>
        <div>
          <p>当前水位：{{ height }} m</p>
        </div>
        <div>
          <p>模拟时间：{{ time + " " + statisticalTime[value - 1] }}</p>
        </div>
      </li>
    </ul>
    <div class="tip" v-if="tip">
      {{ tip }}
    </div>
  </div>
</template>

<script>
  import FloodSimulate from "./js/FloodSimulate";
  import AgPopup from "@/views/components/precut/AgPopup.vue";
  import axios from "qs";
  import qs from "qs"; // 根据需求是否导入qs模块
  let oldterrainProvider
  let math = agcim.maths.math;
  let viewer = CIM.viewer;
  let floodSimulate = undefined;

  export default {
    components: { "ag-popup": AgPopup },
    data() {
      return {
        rainfallSpeed: 200, //降雨量单位mm
        penetrationSpeed: 100, //渗透量单位mm
        startHeight: 0.0, //初始高度
        endHeight: 0.0, //用户设置的最终淹没高度
        defaultEndHeight: 0.0, //区域本身的最终淹没高度
        totalArea: 0.0, //绘制的区域面积
        floodedArea: 0.0, //淹没面积
        floodProportion: 0, //淹没比例
        waterColor: "#409DFD", //水体颜色
        time: 0, //淹没和退水所用时间
        height: 0, //初始高度
        alertHeight: 0.0, //警戒水位单位m
        tip: "", //提示
        value: 2, //模拟速度
        offRain: true, //雨水动画开关
        statisticalTime: ["天", "小时", "秒"],
        simulationBtnTypeIndex: 0,
        simulationBtnTypes: ["执行模拟", "暂停模拟", "退水模拟"],
        isStart: false,
        progress: 0, //高度百分比
        waterLevelReferenceHeight: 0, //水位基准高度
        overAlertHeight: 0, //超警戒水位
        tempHeight: 0,
        points: null,
        isTerrainDepth: false,
        isFreeDraw: false,
        isLineDraw: false,
      };
    },
    destroyed() {
      this.clear();
      CIM.viewer.scene.globe.depthTestAgainstTerrain = this.isTerrainDepth;
      if (oldterrainProvider) {
        viewer.terrainProvider = oldterrainProvider
      }
    },
    async mounted() {
      this.isTerrainDepth = CIM.viewer.scene.globe.depthTestAgainstTerrain;
      CIM.viewer.scene.globe.depthTestAgainstTerrain = true;
      floodSimulate = new FloodSimulate({ viewer: viewer });
      await this.initLayer()
    },
    methods: {
      async initLayer() {
        let terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
          'http://106.55.246.83/models-rest/FXYDEM84', {
          requestVertexNormals: true
        })
        oldterrainProvider = CIM.viewer.terrainProvider
        CIM.viewer.terrainProvider = terrainProvider
        CIM.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(113.59357, 23.14057, 1000.0),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-65.0),
            roll: 0.0
          }
        });
      },
      //绘制范围
      async draw(_type) {
        let isAddTerrian = CIM.viewer.terrainProvider._availability;
        if (!isAddTerrian) {
          this.$message.info("请先切换至地形底图或加载DEM图层！");
          return;
        }
        this.clear();
        let cartesian3AndHeightInfo;
        if (_type === "isMove") {
          this.isFreeDraw = false;
          this.isLineDraw = true;
          cartesian3AndHeightInfo = await floodSimulate.draw({
            isMove: _type,
          });
        } else {
          this.isFreeDraw = true;
          this.isLineDraw = false;
          cartesian3AndHeightInfo = await floodSimulate.draw({
            addPoint: _type
          });
        }
        this.isFreeDraw = false;
        this.isLineDraw = false;
        if (
          !cartesian3AndHeightInfo.minHeight ||
          !cartesian3AndHeightInfo.maxHeight
        ) {
          this.$message.info("请缩放到有地形的范围！");
          return;
        }
        cartesian3AndHeightInfo.minHeight &&
          (this.waterLevelReferenceHeight = this.startHeight =
            math.keepDecimal(cartesian3AndHeightInfo.minHeight, 3));
        cartesian3AndHeightInfo.maxHeight &&
          (this.endHeight = this.defaultEndHeight =
            math.keepDecimal(cartesian3AndHeightInfo.maxHeight, 3));
        this.points = cartesian3AndHeightInfo.positions;
        cartesian3AndHeightInfo.minHeight = this.alertHeight;
        //  this.startHeight = 0.000
        this.totalArea = math.keepDecimal(cartesian3AndHeightInfo.totalArea, 2);
      },
      //0.5秒后提示消失
      disappear() {
        setTimeout(() => {
          this.tip = "";
        }, 500);
      },
      //按钮点击事件
      simulationBtnEvent() {
        if (this.simulationBtnTypeIndex === 0) {
          //开始模拟
          this.start();
        } else if (this.simulationBtnTypeIndex === 1) {
          //暂停模拟
          this.pause();
        } else if (this.simulationBtnTypeIndex === 2) {
          //退水模拟
          this.waterFalling();
        }
      },
      //开始模拟
      start() {
        let _this = this,
          speed = (this.rainfallSpeed - this.penetrationSpeed) / 1000,
          beyondHeight = this.endHeight - this.startHeight - speed;
        this.nowWaterHeight = floodSimulate.getWaterHeight();
        let toastText = !this.points
          ? "请绘制淹没范围"
          : !speed || speed <= 0 || beyondHeight < 0
            ? "请设置正确渗透量和降雨量,降雨量需大于渗透量并且降雨量与渗透量的差值需小于最终淹没高度"
            : this.nowWaterHeight == this.endHeight
              ? "当前水位高度等于最高水位"
              : null;
        if (toastText) {
          this.tip = toastText;
          this.disappear();
          return;
        }
        this.isStart = true;
        this.simulationBtnTypeIndex = 1;

        let params = {
          speed,
          startHeight: Number(this.startHeight),
          endHeight: this.endHeight,
          waterColor: this.waterColor,
          alertHeight: this.alertHeight,
          off: this.offRain, //控制雨水效果
        };
        //开始模拟执行
        floodSimulate.start(
          params,
          (time, height, floodedArea) => {
            _this.setWaterInfo(time, height, floodedArea);
            //超过警戒水位则计算超出值
            if (height > _this.alertHeight) {
              _this.overAlertHeight = (
                height -
                _this.alertHeight -
                _this.startHeight
              ).toFixed(2);
            }
          },
          (success) => {
            //执行开始模拟结束
            this.simulationBtnTypeIndex = 2;
          }
        );
      },
      //暂停模拟
      pause() {
        this.simulationBtnTypeIndex = 0;
        floodSimulate.pause();
      },
      //雨水动画过程可以开关
      rainSwitcher() {
        floodSimulate.pause();
        this.start();
      },
      //退水模拟
      waterFalling() {
        let returnSpeed = (this.rainfallSpeed - this.penetrationSpeed) / 1000,
          beyondHeight = this.endHeight - this.startHeight - returnSpeed,
          _this = this;
        this.nowWaterHeight = floodSimulate.getWaterHeight();
        if (!returnSpeed || returnSpeed <= 0 || beyondHeight < 0) {
          this.tip = "请设置正确渗透量和降雨量,降雨量需大于渗透量并且降雨量与渗透量的差值需小于最终淹没高度";
          this.disappear();
          return;
        }
        if (this.nowWaterHeight == 0 || !this.points) return;
        this.simulationBtnTypeIndex = 3;
        floodSimulate.waterFalling(
          returnSpeed,
          (time, height, floodedArea) => {
            _this.setWaterInfo(time, height, floodedArea);
            //超过警戒水位则计算超出值
            if (height > _this.alertHeight) {
              _this.overAlertHeight = (
                height -
                _this.alertHeight -
                _this.startHeight
              ).toFixed(2);
            } else {
              _this.overAlertHeight = 0;
            }
          },
          (success) => {
            // 执行退水模拟结束
            this.simulationBtnTypeIndex = 0;
          }
        );
      },
      //时间轴滑动条事件
      sliderEncent() {
        var _this = this;
        if (!_this.points) {
          this.tip = "请先绘制淹没范围";
          this.disappear();
        } else {
          //超过警戒水位则计算超出值
          if (_this.height > _this.alertHeight) {
            _this.overAlertHeight = (_this.height - _this.alertHeight).toFixed(2);
          } else {
            _this.overAlertHeight = 0;
          }
          var isRain = _this.offRain;
          if (_this.tempHeight > _this.height) {
            isRain = false;
          }
          _this.tempHeight = _this.height;
          let params = {
            speed: (_this.rainfallSpeed - _this.penetrationSpeed) / 1000,
            startHeight: Number(_this.startHeight),
            endHeight: _this.height,
            waterColor: _this.waterColor,
            alertHeight: _this.alertHeight,
            off: isRain, //控制雨水效果
          };
          //开始模拟执行,滑动条增则加雨水效果减则去掉雨水效果
          floodSimulate.sliderEncentTigger(params, null, null);
        }
      },
      //改变水颜色
      updateWaterColor() {
        let params = {
          waterColor: this.waterColor,
        };
        floodSimulate.updateWaterColor(params);
      },

      //设置弹框信息
      setWaterInfo(time, height, floodedArea) {
        this.time = math.keepDecimal(time, 1);
        this.height = math.keepDecimal(height - this.startHeight, 3);
        this.floodedArea = math.keepDecimal(floodedArea, 2);
        this.floodProportion = math.keepDecimal(
          (this.floodedArea / this.totalArea
            ? this.floodedArea / this.totalArea
            : 0) * 100,
          2
        );
      },
      //重置数据
      clear() {
        this.time = 0;
        this.height = 0;
        this.simulationBtnTypeIndex = 0;
        this.points = null;
        this.isStart = false;
        this.startHeight = 0.0;
        this.endHeight = 0.0;
        this.defaultEndHeight = 0.0;
        this.floodedArea = 0.0;
        this.floodProportion = 0;
        this.totalArea = 0;
        this.overAlertHeight = 0;
        floodSimulate.clearWater();

      },
      //保存水
      saveWaters() {
        var _this = this;
        if (this.points && this.points.length > 0) {
          var objId = Number(
            new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
          );
          let list = {
            id: objId,
            height: this.endHeight,
            extrudedHeight: undefined,
            positions: this.points,
          };
          let params = {
            name: "",
            domain: "GZ",
            usage: "waters",
            json: JSON.stringify(list),
            tag: "",
          };
          let promise = _this.saveJsonStore(params);
          promise.then((res) => {
            if (res.success) {
              this.$message.success("保存成功");
            }
          });
        } else {
          this.$message.info("请先绘制水域范围");
        }
      },
      // 新增json管理数据
      saveJsonStore(params) {
        let promise = axios.post(
          agcim.net.apiPath.io_jsonstore_save,
          qs.stringify(params)
        );
        return promise;
      },
    },
  };
</script>

<style scoped>
  .container {
    box-sizing: border-box;
    height: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .container h3 {
    font-weight: bold;
    margin-bottom: 0px;
  }

  .container::-webkit-scrollbar {
    display: none;
  }

  .parameter-container {
    padding: 0;
  }

  .parameter-container li {
    list-style-type: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    flex-wrap: wrap;
  }

  .parameter-water {
    padding: 6px 0;
  }

  .parameter-water>p,
  .parameter-sty {
    width: 145px;
    text-align: right;
    padding-right: 10px;
  }

  .parameter-input {
    width: 130px;
  }

  .parameter-water {
    justify-content: space-between;
  }

  .analysis-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    margin-bottom: 10px;
  }

  .analysis-btn {
    margin-right: 10px;
  }

  .analysis-btn,
  .save-btn,
  .clear-btn {
    width: 90px;
  }

  .water-info>div {
    flex: 0 0 50%;
    line-height: 26px;
  }

  .water-info>div p {
    width: auto;
  }

  .sample-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sample {
    flex: 1;
    flex: 0 0 50%;
    height: 100px;
    padding: 10px;
    box-sizing: border-box;
  }

  .sample-in {
    background: pink;
    width: 100%;
    height: 100%;
  }

  .slider {
    display: inline-block;
    width: 177px;
    vertical-align: middle;
    margin-left: 20px;
  }

  .infoBox {
    width: 120px;
  }

  .infoBox .content {
    padding: 20px;
    line-height: 1.5;
    background: #fff;
  }

  .infoBox .msg {
    margin-bottom: 20px;
    color: black;
  }

  .tip {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    animation: TipLayer 2s;
  }
</style>