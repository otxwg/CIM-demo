<template>
  <div class="container">
    <div class="content">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="办结日期">
          <el-date-picker v-model="formInline.time" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">导出</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <div class="line"></div>
      <div class="content-table">
        <div style="display: flex;justify-content: space-between;">
          <div><span class="content-table-title">按地区统计申报用时</span><span class="content-table-subtitle">截止于2023-10-23 10:00 共申报项目2300个</span></div>
          <el-checkbox v-model="checked">是否包含并行事项</el-checkbox>
        </div>
        <div class="content-table-warp">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="region" label="行政区划" width="150">
              <template slot-scope="scope">
                <span style="padding-left: 8px;color: #409EFF;"> {{scope.row.region}}</span>
              </template>
            </el-table-column>
            <el-table-column label="立项用地阶段" align="center" width="auto">
              <el-table-column prop="number0" label="项目数" width="80">
              </el-table-column>
              <el-table-column prop="day0" label="平均审批用时（工作日）" width="120">
              </el-table-column>
              <el-table-column prop="nday0" label="平均跨度用时（自然日）" width="120">
              </el-table-column>
            </el-table-column>
            <el-table-column label="工程建设阶段" align="center" width="auto">
              <el-table-column prop="number1" label="项目数" width="80">
              </el-table-column>
              <el-table-column prop="day1" label="平均审批用时（工作日）" width="120">
              </el-table-column>
              <el-table-column prop="nday1" label="平均跨度用时（自然日）" width="120">
              </el-table-column>
            </el-table-column>
            <el-table-column label="施工许可阶段" align="center" width="auto">
              <el-table-column prop="number2" label="项目数" width="80">
              </el-table-column>
              <el-table-column prop="day2" label="平均审批用时（工作日）" width="120">
              </el-table-column>
              <el-table-column prop="nday2" label="平均跨度用时（自然日）" width="120">
              </el-table-column>
            </el-table-column>
            <el-table-column label="竣工验收阶段" align="center" width="auto">
              <el-table-column prop="number3" label="项目数" width="80">
              </el-table-column>
              <el-table-column prop="day3" label="平均审批用时（工作日）" width="120">
              </el-table-column>
              <el-table-column prop="nday3" label="平均跨度用时（自然日）" width="120">
              </el-table-column>
            </el-table-column>
            <el-table-column label="全流程" align="center" width="auto">
              <el-table-column prop="day4" label="平均审批用时（工作日）" width="120">
              </el-table-column>
              <el-table-column prop="nday4" label="平均跨度用时（自然日）" width="120">
              </el-table-column>
            </el-table-column>
          </el-table>

        </div>
      </div>
    </div>

  </div>
</template>
<script>


  export default {
    props: {},
    data() {
      return {
        formInline: {
          time: '',

        },
        show: false,
        tableData: [{
          region: '市级',
          number0: '88',
          day0: '4',
          nday0: '5.5',
          number1: '88',
          day1: '4',
          nday1: '5.5',
          number2: '88',
          day2: '4',
          nday2: '5.5',
          number3: '88',
          day3: '4',
          nday3: '5.5',
          day4: '4',
          nday4: '5.5',

        }, {
          region: '禅城区',
          number0: '88',
          day0: '4',
          nday0: '5.5',
          number1: '88',
          day1: '4',
          nday1: '5.5',
          number2: '88',
          day2: '4',
          nday2: '5.5',
          number3: '88',
          day3: '4',
          nday3: '5.5',
          day4: '4',
          nday4: '5.5',
        }, {
          region: '南海区',
          number0: '88',
          day0: '4',
          nday0: '5.5',
          number1: '88',
          day1: '4',
          nday1: '5.5',
          number2: '88',
          day2: '4',
          nday2: '5.5',
          number3: '88',
          day3: '4',
          nday3: '5.5',
          day4: '4',
          nday4: '5.5',
        }],
        checked:false

      };
    },
    created() { },
    mounted() {

    },
    destroyed() {

    },
    methods: {

    },
  };
</script>
<style lang="less" scoped>
  .container {
    position: fixed;
    left: 180px;
    width: calc(100% - 151px);
    height: 100%;
    top: 0px;
    background: #d3d3d3d3;
    box-sizing: border-box;
  }

  .content {
    background: #fff;
    /* padding: 10px; */
    border-radius: 6px;
    height: 100%;
    width: calc(100% - 32px);

  }

  .demo-form-inline {
    padding: 16px 16px 0 16px;
    display: flex;
    justify-content: space-between;
  }

  .line {
    width: 100%;
    height: 1px;
    background: #d3d3d3d3;
  }

  .content-table {
    position: relative;
    height: calc(100% - 260px);
    padding: 16px;
    color: #666;


    .content-table-title {
      font-weight: 500;
      color: #000;
    }

    .content-table-subtitle {
      font-size: 12px;
      margin-left: 10px;
    }

    .content-table-warp {
      margin-top: 16px;
      height: 100%;
      width: calc(100% - 0px);
    }

  }





  ::v-deep tr th {
    color: #000;
    opacity: 0.8;
  }
</style>