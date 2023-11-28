<template>
  <div class="viewshed-analysis">
    <el-form class="oneMap" ref="formTable" :model="viewshedParams">
      <el-form-item label="视点高度：">
        <el-col :span="16">
          <el-input-number @change="changes" class="oneMap" v-model="viewshedParams.viewHeight"
            controls-position="right" :min="0" />
        </el-col>
        <el-col :span="1" class="lab-color"><label>&nbsp;m</label></el-col>
      </el-form-item>
      <el-form-item label="可视半径：">
        <el-col :span="16">
          <el-input-number @change="changes" class="oneMap" v-model="viewshedParams.viewDistance"
            controls-position="right" :min="0" />
        </el-col>
        <el-col :span="1" class="lab-color"><label>&nbsp;m</label></el-col>
      </el-form-item>
      <el-form-item label="水平视角：">
        <el-col :span="16">
          <el-input-number @change="changes" class="oneMap" v-model="viewshedParams.horizontalViewAngle"
            controls-position="right" :min="0" :max="180" />
        </el-col>
        <el-col :span="1" class="lab-color"><label>&nbsp;度</label></el-col>
      </el-form-item>
      <el-form-item label="垂直视角：">
        <el-col :span="16">
          <el-input-number @change="changes" class="oneMap" v-model="viewshedParams.verticalViewAngle"
            controls-position="right" :min="0" :max="90" />
        </el-col>
        <el-col :span="1" class="lab-color"><label>&nbsp;度</label></el-col>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <div style="display: flex;margin-left: 80px;">
      <div class="draw-btn" @click="start()">
        <el-button type="primary" class="oneMap">开始</el-button>
      </div>
      <div class="draw-btn" @click="pause()">
        <el-button type="primary" class="oneMap" style="margin-left: 16px;">清除</el-button>
      </div>
    </div>

  </div>
</template>

<script>
  // import sceneConfigMixin from '@/views/layout/sceneConfigMixin'
  import Viewshed from './ViewAnalysis.js'
  let viewshedTool = null
  let primitiveArr = []
  let imageryLayer = null
  let math = agcim.maths.math;
  let viewer = CIM.viewer;
  export default {
    // mixins: [sceneConfigMixin],
    data() {
      return {
        viewshedParams: {
          viewHeight: 100,
          viewDistance: 100,
          horizontalViewAngle: 90,
          verticalViewAngle: 60
        }
      }
    },
    beforeDestroy() {
      if (viewshedTool) {
        viewshedTool.clear()
        viewshedTool = null
      }
    },
    destroyed() {
      if (imageryLayer) {
        // imageryLayer.show = true
        viewer.imageryLayers.remove(imageryLayer, true);
      }
      primitiveArr.forEach(tileset => {
        viewer.scene.primitives.remove(tileset)
      })
      this.clear();
    },
    computed: {
      // userInfo() {
      //   return this.$store.state.user.userInfo
      // }
    },
    created() {
      // this.$emit('hidePanel', true)
      // this.getSceneConfig({ roleId: this.userInfo.role_id, code: 'viewshedAnalysis' }, false)

    },
    async mounted() {

      await this.initLayer()
    },
    methods: {
      start() {
        if (viewshedTool) {
          viewshedTool.clear()
          viewshedTool = null
        }
        const panel = () => {
          // this.closePanel()
        }
        viewshedTool = new Viewshed(viewer, this.viewshedParams, panel)
        this.toolActive()
      },
      toolActive(){
        viewshedTool.active()
        this.viewshedParams = viewshedTool.viewsheParam
      },
      async initLayer() {
        primitiveArr = []
        const tileset = await Cesium.Cesium3DTileset.fromUrl('http://106.55.246.83/models-rest/FXYJZModel20210723/tileset.json')
        viewer.scene.primitives.add(tileset);
        viewer.zoomTo(tileset);
        this.translate3dTile(tileset)
        primitiveArr.push(tileset)
        const provider = await new Cesium.WebMapServiceImageryProvider({
          url: 'http://106.55.246.83:9993/agserver/topp/wms',
          layers: 'topp:FXYDOM',
          parameters: {
            service: 'WMS',
            transparent: true, //是否透明
            format: 'image/png',
            srs: 'EPSG:4326',
            styles: '',
          }
        });
        imageryLayer = new Cesium.ImageryLayer(provider);
        viewer.imageryLayers.add(imageryLayer);
      },
      translate3dTile(tileset) {
        //高度偏差，正数为向上偏，负数为向下偏，根据真实的模型位置不断进行调整
        let heightOffset = -50;
        //计算tileset的绑定范围
        let boundingSphere = tileset.boundingSphere;
        //计算中心点位置
        let cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
        //计算中心点位置坐标
        let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude,
          cartographic.latitude, 0);
        //偏移后的三维坐标
        let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude,
          cartographic.latitude, heightOffset);
        let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        //tileset.modelMatrix转换
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
      },

      pause() {
        // this.$emit('hidePanel', true)
        // if (measureArr.length > 0) {
        //   measureArr.map((item) => { // 清除右键测量工具的绘制事件
        //     item && item.destroy()
        //   })
        //   measureArr = []
        // }
       
        if (viewshedTool) {
          viewshedTool.clear()
          viewshedTool = null
        }
      },
      changes() {
        viewshedTool && viewshedTool.update(this.viewshedParams)
      },
      // closePanel() {
      //   this.$emit('hidePanel', false)
      // }
    }
  }
</script>

<style lang="scss" scoped>
  .viewshed-analysis {
    .lab-color {
      color: #fff;
    }

    .el-input-number {
      width: 100%;
    }
  }
</style>