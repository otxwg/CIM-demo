<template>
  <div>
    <div style="display:flex;margin-bottom: 10px;">
      <el-button size="mini" type="primary" @click="drawBaidu">百度坐标转换</el-button>
      <el-button size="mini" type="primary" @click="drawGaussianProjection">高斯克吕格投影坐标转换</el-button>
      <el-button size="mini" type="primary" @click="draw">绘制</el-button>
    </div>
    <el-table v-if="tab" :data="tableData" border style="width: 100%">
      <el-table-column prop="date" label="百度">
        <template slot-scope="scope">

          <div>{{ scope.row.longitude }}</div>
          <div>{{ scope.row.latitude }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="WGS84">
        <template slot-scope="scope">
          <div>{{ scope.row.WGS84Longitude }}</div>
          <div>{{ scope.row.WGS84Latitude }}</div>

        </template>
      </el-table-column>
    </el-table>
    <el-table v-else :data="tableData" border style="width: 100%">
      <el-table-column prop="date" label="高斯克吕格">
        <template slot-scope="scope">
          <div>{{ scope.row.X }}</div>
          <div>{{ scope.row.Y }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="WGS84">
        <template slot-scope="scope">
          <div>{{ scope.row.WGS84Longitude }}</div>
          <div>{{ scope.row.WGS84Latitude }}</div>

        </template>
      </el-table-column>
    </el-table>

  </div>
</template>
<script>
  let viewer = CIM.viewer;;
  let Draw = agcim.interactive.draw;
  let draw = null;
  let BaiDuJson = require('/public/json/Baidu.json')
  let drawGaussianProjectionJson = require('/public/json/GaussKruger.json')
  import { bd09towgs84, WebMercator_to_WGS84 } from './tool.js'
  let entityCollection
  export default {
    props: {},
    data() {
      return {
        depthTestAgainstTerrain: undefined,
        tableData: [],
        tab: true
      };
    },
    created() { },
    mounted() {
      // viewer = CIM.viewer;
      this.depthTestAgainstTerrain = viewer.scene.globe.depthTestAgainstTerrain;
      viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    beforeDestroy() {
      this.clear();
      viewer.scene.globe.depthTestAgainstTerrain = this.depthTestAgainstTerrain;
    },
    methods: {
      //清除数据
      clear() {
        if(entityCollection){
          viewer.dataSources.remove(entityCollection);
        }
      },
      //绘制范围
      drawBaidu() {
        this.tab = true
        this.tableData = BaiDuJson.data.map(item => {
          let cood = bd09towgs84(item.longitude, item.latitude)
          return {
            WGS84Longitude: cood[0],
            WGS84Latitude: cood[1],
            longitude: item.longitude,
            latitude: item.latitude
          }
        })
      },
      //绘制范围
      drawGaussianProjection() {
        this.tab = false
        this.tableData = drawGaussianProjectionJson.data.map(item => {
          // let cood = WebMercator_to_WGS84(item.X, item.Y)
          let cp = agcim.maths.coordinate.mercatorCartesian3ToCartographic(
            CIM.viewer,
            new Cesium.Cartesian2(item.X,  item.Y)
          );
          let point = agcim.maths.coordinate.degreeCartographic(cp);
          return {
            X: item.X,
            Y: item.Y,
            WGS84Longitude: point.lng,
            WGS84Latitude: point.lat
          }
        })

      },
      draw() {
        let viewer = CIM.viewer;
        let entities = viewer.entities;
        entityCollection = new Cesium.CustomDataSource('myData');
        // console.log(this.tableData)
        this.tableData.forEach(item => {
          let entity = new Cesium.Entity({
            name: "点几何对象",
            position: Cesium.Cartesian3.fromDegrees(item.WGS84Longitude, item.WGS84Latitude),
            billboard: {
              image: '/img/地震局.png',
              // 高度（以像素为单位）
              height: 50,
              // 宽度（以像素为单位）
              width: 50,
              // 逆时针旋转
              rotation: 0,
              // 大小是否以米为单位
              sizeInMeters: false,
              // 相对于坐标的垂直位置
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              // 相对于坐标的水平位置
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
              pixelOffset: new Cesium.Cartesian2(-25, -25),
              // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
              scale: 1.0,

              show: true
            }
          });
          entityCollection.entities.add(entity);
          // viewer.entities.add(entity)
        });
        viewer.dataSources.add(entityCollection);
        viewer.flyTo(entityCollection, {
          offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), -Cesium.Math.toRadians(45), this.tab?1000:589000)
        }
        )
      }

    },
  };
</script>