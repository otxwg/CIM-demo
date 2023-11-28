<template>
  <div>
    <el-radio-group v-model="radio">
      <el-radio :label="'面'">面</el-radio>
      <!-- <el-radio :label="'矩形'">矩形</el-radio>
      <el-radio :label="'圆'">圆</el-radio> -->


    </el-radio-group>
    <div>
      <el-button type="primary" style="margin-top: 10px" @click="draw">绘制</el-button>
      <el-button type="primary" style="margin-top: 10px" @click="reset">清除</el-button>
    </div>

  </div>
</template>
<script>
  let viewer = undefined;
  let draw = null;

  let entityCollection
  let entityCollectionHightLight
  let primitiveArr = []
  let oldTerrain
  let imageryLayer
  export default {
    props: {},
    data() {
      return {
        depthTestAgainstTerrain: undefined,
        radio: '面'
      };
    },
    created() { },
    mounted() {
      viewer = CIM.viewer;
      this.depthTestAgainstTerrain = viewer.scene.globe.depthTestAgainstTerrain;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      this.query()
    },
    destroyed() {
      this.clear();
      viewer.scene.globe.depthTestAgainstTerrain = this.depthTestAgainstTerrain;
    },
    methods: {
      //清除数据
      clear() {
        if (
          entityCollection
        ) {
          entityCollection.show = false
        }
        if (
          entityCollectionHightLight
        ) {
          entityCollectionHightLight.show = false
        }
        draw && draw.removeAll();

      },
      reset() {
        if (
          entityCollectionHightLight
        ) {
          entityCollectionHightLight.show = false
        }
        draw && draw.removeAll();
      },

      draw() {
        // debugger
        if (this.radio === '面') {
          draw = new agcim.interactive.draw(CIM.viewer);
          draw
            .drawPolygon({
              material: Cesium.Color.RED.withAlpha(0.4),
              outline: true,
              outlineWidth: 10,
              fill: true,
              outlineColor: Cesium.Color.RED,
            })
            .then(
              (result) => {
                let pointarr = []
                let start
                result.positions.forEach((item, index) => {
                  let point = agcim.maths.coordinate.Cartesian3_to_WGS84(item)
                  pointarr.push([point.lng, point.lat])
                  if (!index) {
                    start = point
                  }
                })
                pointarr.push([start.lng, start.lat])
                this.hightLight(pointarr)
              },
              (error) => {
                console.log(error);
              }
            );
        }
      },
      hightLight(pointarr) {
        let geometry = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              pointarr
            ]
          }
        };
        let queryTask = new agcim.wfs.QueryTask("http://106.55.246.83:9993/agserver/topp/ows");
        let parames = new agcim.wfs.CreateQuery({
          spatialRelationship: "contains",
          geometry: geometry,
          layerName: 'topp:FXYPOI',
        });
        queryTask.execute(parames).then((result) => {
          entityCollectionHightLight = new Cesium.CustomDataSource('entityCollectionHightLight');
          let entity
          result.features.forEach(item => {
            entity = new Cesium.Entity({
              name: "点几何对象",
              position: Cesium.Cartesian3.fromDegrees(item.geometry.coordinates[0], item.geometry.coordinates[1], 10),
              point: {
                pixelSize: 30,
                color: Cesium.Color.YELLOW,
                show: true,
              }
            });
            entityCollectionHightLight.entities.add(entity);
          });
          viewer.dataSources.add(entityCollectionHightLight);

        })
      },

      async query() {
        let layerUrl = "http://106.55.246.83:9993/agserver/topp/ows?service=wfs";
        let typeName = 'topp:FXYPOI'
        let cql_filter = "1=1"
        let res = await Cesium.Resource.fetchJson({
          url: layerUrl,
          queryParameters: {
            request: "GetFeature",
            version: "1.0.0",
            typeName: typeName,
            outputFormat: "application/json",
            cql_filter: cql_filter,
          }
        });
        entityCollection = new Cesium.CustomDataSource('myData');
        let entity
        res.features.forEach(item => {
          entity = new Cesium.Entity({
            name: "点几何对象",
            position: Cesium.Cartesian3.fromDegrees(item.geometry.coordinates[0], item.geometry.coordinates[1], 10),
            point: {
              pixelSize: 30,
              color: Cesium.Color.SKYBLUE,
              show: true,
            }
          });
          entityCollection.entities.add(entity);
        });
        viewer.dataSources.add(entityCollection);
        viewer.flyTo(entityCollection, {
          offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), -Cesium.Math.toRadians(45), 1000)
        }
        )
      },

    },
  };
</script>
<style scoped lang="less">
  /deep/ .el-tree {
    position: relative;
    cursor: default;
    background: #FFF;
    color: #606266;
    background: transparent;
    color: #fff;
  }

  ::v-deep .el-tree-node__content {
    height: 32px;
    line-height: 32px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.5) !important;

    }
  }

  ::v-deep .el-tree-node.is-current>.el-tree-node__content {
    background-color: rgba(255, 255, 255, 0.5);


  }

  ::v-deep .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    background-color: rgba(255, 255, 255, 0.5) !important;
  }
</style>