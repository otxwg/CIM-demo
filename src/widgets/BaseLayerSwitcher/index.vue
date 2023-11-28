<!--
 * @Description: 底图切换功能
 * @Autor: 谢小龙
 * @Date: 2021-12-23 14:56:58
 * @LastEditors: tanggx
 * @LastEditTime: 2023-09-05 14:32:41
-->
<template>
    <div>
        <div class="baselayer-page">
            <!-- 底图 start-->
            <dl>
                <dt class="textCss">
                    <div class="frontstart"></div>
                    底图
                </dt>
                <div class="flex">
                    <dd
                        v-for="item in baseLayerArr"
                        :key="item.name"
                        @mouseover="markShow(item.name)"
                        @mouseout="markHidden(item.name)"
                        @click="selectedBaseStyle(item.name)"
                    >
                        <div class="layer-main">
                            <div v-if="item.mark==true" v-show="markConfig.display[item.name]" class="layer-box">
                                <el-checkbox :checked="markConfig.mark[item.name]" @click.stop @change="onChange(item)">
                                    <span class="checkbox-span">开启注记</span>
                                </el-checkbox>
                            </div>
                            <div @click="changeBaseLayer(item)" class="layer-img">
                                <img v-bind:class="{'selected-img': baseLayer[item.name]}" :src="item.iconUrl" alt=""/>
                                <div v-show="baseLayer[item.name]" class="layer-check-base"></div>
                                <div v-show="baseLayer[item.name]" class="icon-check-base">
                                   <i class="el-icon-check"></i>
                                </div>
                            </div>

                        </div>

                        <p v-bind:class="{'selected-font': baseLayer[item.name]}">{{ item.name }}</p>
                    </dd>
                </div>
            </dl>
            <!-- 底图 end-->
            <!-- 地形 start-->

            <dl>
                <dt class="textCss">
                    <div class="frontstart"></div>
                    地形
                </dt>
                <div class="flex">
                    <dd
                        v-for="item in terrainArr"
                        :key="item.name"
                        @click="changeTerrain(item)"
                    >
                        <!-- 地形切换与imageryLayer无关，不需要点击绑定changeBaseLayer函数-->
                        <div class="layer-img">
                            <img v-bind:class="{'selected-img': terrainLayer[item.name]}" :src="item.iconUrl" alt=""/>
                            <div v-show="terrainLayer[item.name]" class="layer-check-terrain"></div>
                            <div v-show="terrainLayer[item.name]" class="icon-check-terrain">
                               <i class="el-icon-check"></i>
                            </div>
                        </div>
                        <p v-bind:class="{'selected-font': terrainLayer[item.name]}">{{ item.name }}</p>
                    </dd>
                </div>
            </dl>
            <!-- 地形 end-->
            <dl>
                <dt class="textCss">
                    <div class="frontstart"></div>
                    覆盖物
                </dt>
                <div class="flex">
                    <dd
                        v-for="item in coveringArr"
                        :key="item.name"
                        @click="changeCovering(item)"
                    >
                        <!-- 地形切换与imageryLayer无关，不需要点击绑定changeBaseLayer函数-->
                        <div class="layer-img">
                            <img v-bind:class="{'selected-img': coveringLayer[item.name]}" :src="item.iconUrl" alt=""/>
                            <div v-show="coveringLayer[item.name]" class="layer-check-terrain"></div>
                            <div v-show="coveringLayer[item.name]" class="icon-check-terrain">
                                <i class="el-icon-check"></i>
                            </div>
                        </div>
                        <p v-bind:class="{'selected-font': coveringLayer[item.name]}">{{ item.name }}</p>
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</template>
<script>

let viewer = null;
import config from "./js/config";

var axiosWraper = agcim.net.axiosWraper;
let agUnified3DTiles
let agUnifiedIntegratedMeshLayer

export default {
    data() {
        return {
            visible: true,
            checked: false,
            baseLayerArr: config.defaultLayer[1].name === "基础影像" ? [config.defaultLayer[1]] : [config.defaultLayer[2]], // 底图服务
            markConfig: config.markConfig,
            currentLayer: '',
            baseLayer: config.baseLayer,
            terrainLayer: config.terrainLayer,
            coveringLayer: config.coveringLayer,
            layerStyle: config.layer,
            terrainArr: config.defaultLayer[0].name === "椭球平面" ? [config.defaultLayer[0]] : [], // 地形服务
            coveringArr: config.defaultCovering[0].name === "无覆盖物" ? [config.defaultCovering[0]] : [],
            markLayerArr: [], // 标注服务
            markLayerServe: null, // 已开启的标注服务
            tdt_token: '8487c77b8410d6c9cd4a22cac7b0d902',
            currentCoveringList: [config.defaultCovering[0].coveringInfo.layerTable],
            coveringObj: {}
        };
    },
    mounted() {
        viewer = CIM.viewer;
        this.getProjectLayerTree();
    },
    created() {
        this.currentSelectLayer = config.currentSelectLayer;
        this.vmconfig = config;
        this.vmconfig.getToken().then((data) => {
            if (data.success && data.content.length > 0) {
                this.tdt_token = data.content[0].value;
            }
        })
    },
    watch: {
        '$store.state.baseLayerSwitchState'() {
            this.baseLayerArr = config.defaultLayer[1].name === "基础影像" ? [config.defaultLayer[1]] : [config.defaultLayer[2]];
            this.baseLayer = config.baseLayer;
            this.getProjectLayerTree();
        }
    },
    methods: {
        /**
         * @description: 获取图层树
         * @param {*}
         * @return {*}
         * @author: 谢小龙
         */
        getProjectLayerTree() {
            let res = {}
            if (CIM_LAYERTREE_NAME !== this.$store.state.projectName) {
                axiosWraper.getData(agcim.net.apiPath.project_getProjectLayerTree, {
                    projectName: CIM_LAYERTREE_NAME,
                    emptydir: true,
                }).then((res) => {
                    this.$store.commit("changeProjectName", CIM_LAYERTREE_NAME);
                    this.$store.commit("changeLayerTreeResult", res);
                    if (res.success && res.content[1].length > 0) {
                        config.selectLayer(res, this)
                    }
                })
            } else {
                res = this.$store.state.layerTreeResult
                if (res.success && res.content[1].length > 0) {
                    config.selectLayer(res, this)
                }
            }


        },
        /**
         * @description: 选择底图
         * @param {*} o
         * @return {*}
         * @author: 谢小龙
         */
        changeBaseLayer(o) {
            var layers = viewer.imageryLayers._layers;
            if (this.markLayerServe && this.markConfig.layer.name !== o.name) {
                this.currentSelectLayer.layerTreeInfo._aglayers.forEach(item => {
                    for (let i = 0; i < this.markLayerArr.length; i++) {
                        let layer = this.markLayerArr[i];
                        this.currentSelectLayer.layerTreeInfo.removeLayerById(layer.id, 0);
                    }
                });
                this.markConfig.mark[this.markConfig.layer.name] = false; //关闭当前的注记 不生效
                this.markConfig.layer.name = '';
                this.markLayerServe = null
            }
            if (this.currentSelectLayer.basemap.name === o.name) {
                this.deleteLoadedLayers()
            } else {
                for (let key in this.baseLayer) {
                    if (key !== 'selectedLayer') {
                        if (key == o.name) {
                            this.baseLayer[key] = true;
                        } else {
                            this.baseLayer[key] = false;
                        }
                    }
                }
                //底图必须加载在最下面，才不会遮挡上面的影像等信息
                this.currentLayer = o.name;
                this.deleteLoadedLayers()
                o.creationFunction(viewer, 0);
            }
        },
        /**
         * @description: 选择地形
         * @param {*} o
         * @return {*}
         * @author: 谢小龙
         */
        changeTerrain(o) {
            if (this.currentSelectLayer.terrain.name === o.name) {
                CIM.layerTree.uncheckAllTerrain();
                this.currentSelectLayer.layerTreeInfo._aglayers.forEach(item => {
                    if (o.id === item.agMetaData.id) {
                        this.currentSelectLayer.layerTreeInfo.removeLayerById(item.agMetaData.id, 0);
                    }
                });
                this.currentSelectLayer.terrain = {}
                for (let key in this.terrainLayer) {
                    if (key !== 'selectedLayer') {
                        this.terrainLayer[key] = false;
                    }
                }
                this.$forceUpdate();
            } else {
                o.creationFunction(viewer);
                this.currentSelectLayer.terrain = o
                this.selectedterrianStyle(o.name);
            }
        },
        changeCovering(o) {
            if (o.name === '无覆盖物') {
                this.coveringLayer[o.name] = true;
                for (let key in this.coveringLayer) {
                    if (key !== 'selectedLayer' && key !== '无覆盖物') {
                        this.coveringLayer[key] = false;
                    }
                }
                this.currentCoveringList = [config.defaultCovering[0].coveringInfo.layerTable]
                this.$forceUpdate();
                agUnified3DTiles.remove()
                agUnifiedIntegratedMeshLayer.remove()
            } else {
                this.coveringLayer.无覆盖物 = false;
                if (this.currentCoveringList.indexOf(o.coveringInfo.layerTable) !== -1) {
                    this.coveringLayer[o.name] = false;
                    this.currentCoveringList.splice(this.currentCoveringList.indexOf(o.coveringInfo.layerTable), 1);
                    this.$forceUpdate();
                    if (this.currentCoveringList.length === 1) {
                        this.coveringLayer.无覆盖物 = true;
                    }
                    switch (o.coveringInfo.layerTable) {
                        case '0':
                            agUnifiedIntegratedMeshLayer.remove()
                            break;
                        case '1':
                            agUnified3DTiles.remove()
                            break;
                    }
                    return;
                }
                this.currentCoveringList.push(o.coveringInfo.layerTable);
                this.coveringObj[o.coveringInfo.layerTable] = o
                this.coveringLayer[o.name] = true;
                this.$forceUpdate();
                this.loadUnitaryService()
            }
        },
        
        loadUnitaryService() {
            for (let i = 0; i < this.currentCoveringList.length; i++) {
                if (this.coveringObj[this.currentCoveringList[i]]) {
                    let coveringInfo = this.coveringObj[this.currentCoveringList[i]].coveringInfo;
                    switch (coveringInfo.layerTable) {
                        case '0':
                            agUnifiedIntegratedMeshLayer = new agcim.layer.AgUnifiedIntegratedMeshLayer(coveringInfo)
                            agUnifiedIntegratedMeshLayer._addToViewer()
                            break
                        case '1':
                            agUnified3DTiles = new agcim.layer.AgUnified3DTiles(coveringInfo)
                            agUnified3DTiles._addToViewer()
                            break
                    }
                }
            }
        },
        /**
         * @description: 切换过程中判断当前底图是否具有注记
         * @param {*} o
         * @return {*}
         * @author: 谢小龙
         */
        onChange(o) {
            var layers = viewer.imageryLayers._layers;
            this.markConfig.mark[o.name] = !this.markConfig.mark[o.name];
            if (this.markConfig.mark[o.name] == true) {
                this.currentSelectLayer.layerInfoId = o.id
                if (this.markConfig.layer.name != '') {
                    this.markConfig.mark[this.markConfig.layer.name] = false;
                }
                if (o.name != this.currentLayer && this.markConfig.layer.name != o.name) {
                    this.deleteLoadedLayers()
                    o.creationFunction(viewer, 0)
                    this.markConfig.layer.name = o.name;
                    this.currentLayer = o.name;
                }
                for (let i = 0; i < this.markLayerArr.length; i++) {
                    if (this.markLayerArr[i].tooltip == o.name) { // 注记服务的别称与底图服务的真实名称对应
                        let layer = this.markLayerArr[i];
                        this.markConfig.layer.subscript = layers.length;
                        this.markLayerServe = this.markConfig.layer.subscript
                        layer.creationFunction(viewer)
                        this.markConfig.layer.name = o.name;
                        break;
                    }
                }
            } else {
                if (this.markConfig.layer.subscript != 0) {
                    if (this.markLayerServe) {
                        this.currentSelectLayer.layerTreeInfo._aglayers.forEach(item => {
                            for (let i = 0; i < this.markLayerArr.length; i++) {
                                if (this.markLayerArr[i].tooltip === o.name) { // 注记服务的别称与底图服务的真实名称对应
                                    let layer = this.markLayerArr[i];
                                    this.currentSelectLayer.layerTreeInfo.removeLayerById(layer.id, 0);
                                    break;
                                }
                            }
                        });
                        this.markConfig.layer.name = '';
                        this.markLayerServe = null
                    }
                }
            }
            this.currentSelectLayer.layerInfoId = o.id
        },
        /**
         * @description: 显示注记
         * @param {*} key
         * @return {*}
         * @author: 谢小龙
         */
        markShow(key) {
            this.markConfig.display[key] = true;
        },
        /**
         * @description: 隐藏注记
         * @param {*} key
         * @return {*}
         * @author: 谢小龙
         */
        markHidden(key) {
            this.markConfig.display[key] = false;
        },
        /**
         * @description: 选择底图样式
         * @param {*} key
         * @return {*}
         * @author: 谢小龙
         */
        selectedBaseStyle: function (key) {
            if (this.currentSelectLayer.basemap.name === key) {
                this.currentSelectLayer.basemap = {}
                for (let key in this.baseLayer) {
                    if (key !== 'selectedLayer') {
                        this.baseLayer[key] = false;
                    }
                }
                return
            }
            this.baseLayer[this.baseLayer.selectedLayer] = false;
            this.baseLayer[key] = true;
            this.baseLayer.selectedLayer = key;
            this.currentSelectLayer.basemap = {name: key}
        },
        /**
         * @description: 选择地形样式
         * @param {*} key
         * @return {*}
         * @author: 谢小龙
         */
        selectedterrianStyle: function (key) {
            this.terrainLayer[this.terrainLayer.selectedLayer] = false;
            this.terrainLayer[key] = true;
            this.terrainLayer.selectedLayer = key;
            this.$forceUpdate();
        },
        /**
         * 删除已加载图层
         */
        deleteLoadedLayers() {
            if (this.currentSelectLayer.layerInfoId === 'NaturalEarthII') {
                CIM.viewer.imageryLayers._layers.forEach(val => {
                    if (val.imageryProvider.url.indexOf('NaturalEarthII') !== -1) {
                        CIM.viewer.imageryLayers.remove(val)
                    }
                })
            } else {
                this.currentSelectLayer.layerTreeInfo._aglayers.forEach(item => {
                    if (this.currentSelectLayer.layerInfoId === item.agMetaData.id) {
                        this.currentSelectLayer.layerTreeInfo.removeLayerById(item.agMetaData.id, 0)
                    }
                });
            }
        }
    },
};
</script>
<style scoped>
::v-deep .el-checkbox{
    color:#fff
}
.baselayer-page {
    /* width: 100%; */
    width: 288px;
    margin: 4px 4px;
    padding: 10px;
}

.baselayer-page .flex {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    text-align: center;
}

.baselayer-page dt {
    /* font-size: 16px; */
    margin-bottom: 5px;
}

.baselayer-page dd {
    flex: 1;
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    /* margin-right:10px ; */
}

.baselayer-page dd:not(:last-child) {
    margin-right: 9px;
}

.baselayer-page dd:hover {
    cursor: pointer;
    color: rgb(53, 104, 151);
}

.baselayer-page dd img {
    height: 80px;
    width: 80px;
    border-radius: 2px;
    background-size: contain;
    background-image: url(./img/TerrainProviders/WGS84.png);
}

.baselayer-page dd p {
    font-size: 14px;
    line-height: 1.2;
    width: 80px;
    margin-top: 5px;
}

.setting {
    float: right;
    font-size: 13px;
}

.frontstart {
    float: left;
    width: 3px;
    height: 14px;
    margin-top: 3.5px;
    margin-right: 5px;
    background: #1982f2;
}

.textCss {
    font-size: 14px;
    font-weight: bold;
}

.layer-box {
    position: absolute;
    background-color: rgba(122, 121, 120, 0.7);
    z-index: 1000;
    padding-left: 4px;
    padding-right: 0px;
    padding-bottom: 2px;
}

.layer-check-base {
    position: absolute;
    z-index: 1000;
    top: 52px;
    height: 0px;
    width: 0px;
    border-top: 14px solid rgb(57, 137, 252, 0);
    border-left: 14px solid rgb(57, 137, 252, 0);
    border-right: 14px solid rgb(57, 137, 252);
    border-bottom: 14px solid rgb(57, 137, 252);
    margin-left: 52px;
}

.layer-check-terrain {
    position: absolute;
    z-index: 1000;
    top: 52px;
    height: 0px;
    width: 0px;
    border-top: 14px solid rgb(57, 137, 252, 0);
    border-left: 14px solid rgb(57, 137, 252, 0);
    border-right: 14px solid rgb(57, 137, 252);
    border-bottom: 14px solid rgb(57, 137, 252);
    margin-left: 52px;
}

.icon-check-base {
    position: absolute;
    z-index: 1002;
    top: 61px;
    margin-left: 64px;
}

.icon-check-terrain {
    position: absolute;
    z-index: 1002;
    top: 61px;
    margin-left: 64px;
}

.selected-img {
    border: 2px solid rgb(57, 137, 252);
    border-radius: 2px;
}

.selected-font {
    color: rgb(57, 137, 252);
}

.layer-img {
    position: relative;
}

.ant-checkbox {
    width: 14px;
    height: 14px;
}

.ant-checkbox-inner {
    width: 14px;
    height: 14px;
}

.checkbox-span {
    margin-left: -4px;
}

.ant-checkbox-wrapper {
    font-size: 4px;
    color: white;
}

img:before {
    content: " ";
    display: block;
    position: absolute;
    left: 2px;
    height: 20px;
    width: 20px;
    background-color: #b4b6a9;
    border: #b4b6a9;
    border-radius: 5px;
}

/*img:after {*/
/*  content: "";*/
/*  display: block;*/
/*  font-size: 16px;*/
/*  font-style: normal;*/
/*  font-family: FontAwesome;*/
/*  color: rgb(100, 100, 100);*/
/*  position: absolute;*/
/*  top: 5px;*/
/*  left: 0;*/
/*  width: 100%;*/
/*  text-align: center;*/
/*}*/
</style>
