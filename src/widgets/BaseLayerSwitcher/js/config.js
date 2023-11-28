/*
 * @Description: 底图切换功能相关参数和方法
 * @Autor: 谢小龙
 * @Date: 2021-12-23 14:56:58
 * @LastEditors: yangwq
 * @LastEditTime: 2023-10-16 09:07:15
 */
var axiosWraper = agcim.net.axiosWraper;
let layerTree = new agcim.scene.LayerTree(CIM.viewer);
// 未配置默认底图和地形时加载
let defaultLayer = [
  {
    name: "椭球平面",
    iconUrl: require("../img/TerrainProviders/WGS84.png"),
    tooltip: "WGS84 standard ellipsoid, also known as EPSG:4326",
    category: "地形",
    creationFunction: function () {
      layerTree.uncheckAllTerrain(); //去掉图层树上所有地形勾选
      CIM.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    },
  },
  {
    name: "基础影像",
    tooltip: "基础影像底图",
    iconUrl: require("../img/googleSatellite.png"),
    category: "底图",
    mark: false,
    creationFunction: (viewer, index) => {
      currentSelectLayer.layerInfoId = "NaturalEarthII";
      viewer.imageryLayers.add(
        Cesium.ImageryLayer.fromProviderAsync(
          Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
            { fileExtension: "jpg", maximumLevel: 2 }
          )
        ),
        index
      );
      // viewer.imageryLayers.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
      //     url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
      // }), index)
    },
  },
  {
    name: "基础影像",
    tooltip: "基础影像底图",
    iconUrl: require("../img/googleSatellite.png"),
    category: "底图",
    mark: false,
    creationFunction: function (viewer, index) {
      currentSelectLayer.layerInfoId = "NaturalEarthII";
      viewer.imageryLayers.add(
        Cesium.ImageryLayer.fromProviderAsync(
          Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
            { fileExtension: "jpg", maximumLevel: 2 }
          )
        ),
        index
      );
      // viewer.imageryLayers.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
      //     url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
      // }), index)
    },
  },
];

let defaultCovering = [
  {
    name: "无覆盖物",
    tooltip: "无覆盖物",
    iconUrl: require("../img/googleSatellite.png"),
    category: "覆盖物",
    coveringInfo: { layerTable: -1 },
    mark: false,
  },
];

let markConfig = {
  mark: {
    天地图影像: false,
    天地图矢量: false,
  },
  display: {
    天地图影像: false,
    天地图矢量: false,
  },
  layer: {
    subscript: 0,
    name: "",
  },
};

// 底图配置 【默认选中基础影像】
let baseLayer = {
  基础影像: true,
  selectedLayer: "基础影像",
};

// 地形配置 【默认选中椭球平面】
let terrainLayer = {
  椭球平面: true,
  selectedLayer: "椭球平面",
};

// 覆盖物配置 【默认无覆盖物】
let coveringLayer = {
  无覆盖物: true,
  selectedLayer: "无覆盖物",
};

// 当前选中的底图图层
let currentSelectLayer = {};

/**
 * @description: 根据底图类型来选中对应的服务
 * @param {*} params
 * @return {*}
 * @author: 谢小龙
 */
function setBaseLayer(params) {
  let layerObj = {};
  let layerInfo = JSON.parse(params.data);
  layerObj.name = params.text;
  layerObj.id = params.id;
  layerObj.tooltip = params.nameCn;
  layerObj.iconUrl =
    agcim.net.apiPath.upload_layer_picture + layerInfo.metadataPicture;
  layerObj.mark =
    params.text.indexOf("天地图矢量") !== -1 ||
    params.text.indexOf("天地图影像") !== -1;
  if (params.layerType === "014000" || params.layerType === "021500") {
    layerObj.category = "地形";
  } else if (params.layerType === "015100") {
    layerObj.category = "覆盖物";
    layerObj.coveringInfo = params;
  } else {
    layerObj.category = params.text.indexOf("注记") !== -1 ? "注记" : "底图";
  }
  if (params.layerType !== "015100") {
    layerObj.creationFunction = (viewer, layerIndex) => {
      params.layerIndex = layerIndex;
      layerTree.loadLayer(params);
      currentSelectLayer.layerInfoId = params.id;
    };
  }
  currentSelectLayer.layerTreeInfo = layerTree;
  return layerObj;
}

/**
 * @description: 根据配置在初始化时显示默认底图和地形，如果后台没有配置，则默认显示必应底图
 * @param {*}
 * @return {*}
 * @author: 谢小龙
 */
async function setDefaultLayer(mapVM) {
  currentSelectLayer.basemap = defaultLayer[1];
  currentSelectLayer.terrain = defaultLayer[0];
  let userInfo = localStorage.getItem("user");
  let user = JSON.parse(userInfo);
  let res = {};
  if (CIM_LAYERTREE_NAME !== mapVM.$store.state.projectName) {
    res = await axiosWraper.getData(
      agcim.net.apiPath.project_getProjectLayerTree,
      {
        projectName: CIM_LAYERTREE_NAME,
        // userId: user.userId,
        emptydir: true,
      }
    );
    mapVM.$store.commit("changeProjectName", CIM_LAYERTREE_NAME);
    mapVM.$store.commit("changeLayerTreeResult", res);
  } else {
    res = mapVM.$store.state.layerTreeResult;
  }
  res.content[1].forEach((item) => {
    let layer = setBaseLayer(item);
    if (layer.category === "底图") {
      if (item.state.isShow === "1") {
        defaultLayer[1] = layer;
        currentSelectLayer.basemap = defaultLayer[1];
      }
    } else if (layer.category === "地形") {
      if (item.state.isShow === "1") {
        defaultLayer[0] = layer;
        currentSelectLayer.terrain = defaultLayer[0];
      }
    }
  });
}

/**
 * @description: 将地形、底图、标注分类，并根据后台配置信息给默认对应的默认底图和地形打勾
 * @param {*} res
 * @param {*} _this
 * @return {*}
 * @author: 谢小龙
 */
function selectLayer(res, _this) {
  res.content[1].forEach((item) => {
    let baseLayer = setBaseLayer(item);
    if (baseLayer.category === "注记") {
      _this.markLayerArr.push(baseLayer);
    } else if (baseLayer.category === "底图") {
      _this.baseLayerArr.push(baseLayer);
      let isShow = item.state.isShow === "1";
      _this.$set(_this.baseLayer, item.text, isShow);
      // _this.baseLayer[item.text] = item.state.isShow === "1"
    } else if (baseLayer.category === "地形") {
      _this.terrainArr.push(baseLayer);
      _this.terrainLayer[item.text] = item.state.isShow === "1";
    } else if (baseLayer.category === "覆盖物") {
      _this.coveringArr.push(baseLayer);
      _this.coveringArr[item.text] = item.state.isShow === "1";
    }
  });
  // 根据后台配置给默认显示的底图打勾
  for (let key in _this.baseLayer) {
    if (_this.baseLayer[key] === true && key !== "基础影像") {
      _this.baseLayer.基础影像 = false;
      _this.baseLayer.selectedLayer = key;
    }
  }
  for (let key in _this.baseLayer) {
    if (key !== _this.baseLayer.selectedLayer && key !== "selectedLayer") {
      // _this.baseLayer[key] = false
    }
  }
  for (let key in _this.terrainLayer) {
    if (_this.terrainLayer[key] === true && key !== "椭球平面") {
      _this.terrainLayer.椭球平面 = false;
      _this.terrainLayer.selectedLayer = key;
    }
  }
  for (let key in _this.terrainLayer) {
    if (key !== _this.terrainLayer.selectedLayer && key !== "selectedLayer") {
      _this.terrainLayer[key] = false;
    }
  }
}

/**
 * @description: 获取token
 * @param {*}
 * @return {*}
 * @author: 谢小龙
 */
function getTokenInner() {
  return;
  return axiosWraper.getData(
    agcim.net.apiPath.keyvalue_findKeyValue + "?key=BaseLayerSwitcher_tdt_token"
  );
}

getTokenInner().then(function (data) {
  return;
  if (data.success && data.content.length > 0) {
    window.localStorage.setItem(
      "BaseLayerSwitcher_tdt_token",
      data.content[0].value
    );
  }
});

function setToken(token) {
  return axiosWraper.getData(
    agcim.net.apiPath.keyvalue_save +
      "?domain=CIM&key=BaseLayerSwitcher_tdt_token&value=" +
      token
  );
}

function getToken() {
  return getTokenInner();
}

export default {
  defaultLayer,
  defaultCovering,
  markConfig,
  baseLayer,
  terrainLayer,
  coveringLayer,
  setBaseLayer,
  setDefaultLayer,
  selectLayer,
  currentSelectLayer,
  setToken,
  getToken,
};
