<template>
  <div>
    <el-tree :data="data" show-checkbox node-key="id" :props="defaultProps" @node-click="handleNodeClick"
      @check-change="handleCheckChange"></el-tree>

  </div>
</template>
<script>
  let  viewer = CIM.viewer;;
  let Draw = agcim.interactive.draw;
  let draw = null;

  let entityCollection
  let primitiveArr = []
  let oldTerrain
  let imageryLayer
  export default {
    props: {},
    data() {
      return {
        depthTestAgainstTerrain: undefined,
        data: [

          {
            id: 2,
            label: '试题二：凤馨苑二三维数据',
            children: [
              {
                id: 1,
                label: '凤馨苑影像数据',
                url: 'http://106.55.246.83:9993/agserver/topp/wms',
                typeName: 'topp:FXYDOM',
                type: 'wms'
              },
              {
                id: 2,
                label: '凤馨苑兴趣点数据',
                url: 'http://106.55.246.83:9993/agserver/topp/ows',
                typeName: 'topp:FXYPOI',
                type: 'wfs',
                layType: 'Point'
              },
              {
                id: 3,
                label: '凤馨苑规划图区报建数据',
                url: 'http://106.55.246.83:9993/agserver/topp/ows',
                typeName: 'topp:FXYGHTQBJ',
                type: 'wfs',
                layType: 'LineString'
              },
              {
                id: 4,
                label: '凤馨苑建筑',
                url: 'http://106.55.246.83/models-rest/FXYJZModel20210723/tileset.json',
                type: '3dtile'
              },
              {
                id: 5,
                label: '凤馨苑建筑DEM数据',
                url: 'http://106.55.246.83/models-rest/FXYDEM84',
                type: 'DEM'
              }
            ]
          },
          // {
          //   id: 1,
          //   label: '试题一：广州数据',
          //   children: [
          //     {
          //       label: '广州影像数据',
          //       url: 'http://agcimdev.gzcc.gov.cn:6080/arcgis/rest/services/Hosted/GZImage_GZ2000_20211202/MapServer'
          //     },
          //     {
          //       label: '广州街道、镇界线数据',
          //       url: 'http://agcimdev.gzcc.gov.cn:6080/arcgis/rest/services/2DData/2DData20211126/MapServer/19',
          //       type: 'MapServer'
          //     },
          //     {
          //       label: '广州河流',
          //       url: 'http://agcimdev.gzcc.gov.cn:6080/arcgis/rest/services/2DData/2DData20211126/MapServer/9',
          //       type: 'MapServer'
          //     },
          //     {
          //       label: '三维建筑',
          //       url: 'http://172.18.80.57/models-rest/rest/models/preview/GDSGZSHZQGDDWDDGZ200020221116/tileset.json',
          //       type: '3dtile'
          //     },
          //     {
          //       label: '广州DEM数据',
          //       url: 'http://agcimdev.gzcc.gov.cn:6080/arcgis/rest/services/GZSDEM20211129/ImageServer',
          //       type: 'DEM'
          //     }
          //   ]
          // },

        ],
        defaultProps: {
          children: 'children',
          label: 'label'
        },


      };
    },
    created() { },
    mounted() {
      // console.log(agcim)
     
      this.depthTestAgainstTerrain = viewer.scene.globe.depthTestAgainstTerrain;
      viewer.scene.globe.depthTestAgainstTerrain = true;
    },
    destroyed() {
      this.clear();
      viewer.scene.globe.depthTestAgainstTerrain = this.depthTestAgainstTerrain;
    },
    methods: {
      //清除数据
      clear() {
        primitiveArr.forEach(item => {
          viewer.scene.primitives.remove(item.tileset)
        })
        if (oldTerrain) {
          viewer.terrainProvider = oldTerrain
        }
        if (entityCollection) {
          viewer.dataSources.remove(entityCollection);
        }
        if (imageryLayer) {
          // imageryLayer.show = true
          viewer.imageryLayers.remove(imageryLayer, true); 
        }

      },
      draw() {
      },
      handleNodeClick(data) {
      },
      async handleCheckChange(data, checked, indeterminate) {
        let viewer = CIM.viewer
        if (!checked) {
          primitiveArr.forEach(item => {
            if (item.id === data.id) {
              viewer.scene.primitives.remove(item.tileset)
            }
          })
          if (data.type === 'DEM') {
            viewer.terrainProvider = oldTerrain
          }
          if (data.type === 'wfs') {
            if (entityCollection) {
              entityCollection.show = false
            }
          }
          if (data.type === 'wms') {
            imageryLayer.show = false
          }
        } else {
          if (data.type === '3dtile') {
            const tileset = await Cesium.Cesium3DTileset.fromUrl(data.url);
            viewer.scene.primitives.add(tileset);
            viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
            primitiveArr.push({ id: data.id, tileset: tileset })
          }
          if (data.type === 'DEM') {
            oldTerrain = viewer.terrainProvider
            let terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
              data.url, {
              requestVertexNormals: true
            })
            viewer.terrainProvider = terrainProvider
          }
          if (data.type === 'wfs') {
            this.query(data)
          }
          if (data.type === 'wms') {
            if (imageryLayer) {
              imageryLayer.show = true
              return
            }
            const provider = await new Cesium.WebMapServiceImageryProvider({
              url: data.url,
              layers: data.typeName,
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
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(113.59357, 23.14057, 1000.0),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-65.0),
                roll: 0.0
              }
            });
          }
        }
      },
      async query(data) {
        let layerUrl = "http://106.55.246.83:9993/agserver/topp/ows?service=wfs";
        let typeName = data.typeName
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
          if (data.layType === 'Point') {
            entity = new Cesium.Entity({
              name: "点几何对象",
              position: Cesium.Cartesian3.fromDegrees(item.geometry.coordinates[0], item.geometry.coordinates[1]),
              billboard: {
                image: '/img/地震局.png',
                height: 30,
                width: 30,
                rotation: 0,
                sizeInMeters: false,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                scale: 1.0,
                show: true
              },
              label: {
                id: 'my label',
                text: item.properties.NAME,
                // text: "Philadelphia",
                font: "14px Helvetica",
                fillColor: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0.0, -60),
              }
            });
          }
          if (data.layType === 'LineString') {
            let coordinate = []
            item.geometry.coordinates[0].forEach(i => {
              coordinate.push(i[0])
              coordinate.push(i[1])
            })
            entity = new Cesium.Entity({
              name: "几何对象",
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(coordinate),
                width: 2
              },

            });
          }
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