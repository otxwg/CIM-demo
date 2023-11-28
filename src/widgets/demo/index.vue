<template>
  <div>
    <el-button @click="draw">绘制面</el-button>
  </div>
</template>
<script>
  let viewer = undefined;
  let Draw = agcim.interactive.draw;
  let draw = null;

  export default {
    props: {},
    data() {
      return {
        depthTestAgainstTerrain: undefined,
      };
    },
    created() { },
    mounted() {
      viewer = CIM.viewer;
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
        draw.removeAll();
      },
      //绘制范围
      draw() {
        if (!draw) {
          draw = new Draw(viewer);
        }
        draw.drawPolygon();
      },
    },
  };
</script>