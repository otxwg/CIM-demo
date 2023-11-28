<template>
  <div class="container">
    <div class="content">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="签收状态">
          <el-radio-group v-model="formInline.radio">
            <el-radio label="全部">全部</el-radio>
            <el-radio label="未签收">未签收</el-radio>
            <el-radio label="已签收">已签收</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="搜索关键字" style="margin-left: 40px;">
          <el-input v-model="formInline.keyWord" clearable placeholder="关键字" style="width: 600px;"> <el-button
              slot="append" icon="el-icon-search" type="primary">查询</el-button></el-input>
        </el-form-item>

        <el-form-item>
          <div style="color: #409EFF;cursor: pointer;margin-right: 10px;"><span @click="show=!show">高级查询</span>
            <i v-if="show" class="el-icon-arrow-down"></i>
            <i v-else class="el-icon-arrow-up"></i>
          </div>
        </el-form-item>
        <el-form-item style="color: #666;position: absolute;right: 70px;">
          <el-button-group>
            <el-button size="mini" type="primary" icon="el-icon-menu"></el-button>
            <el-button size="mini" type=""><i class="el-icon-menu"></i></el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <div class="line"></div>
      <div class="content-table">
        <div class="content-table-warp">
          <el-table :data="tableData" border style="width: 100%;">
            <el-table-column prop="type" label="类型" width="60">
            </el-table-column>
            <el-table-column prop="number" label="申报流水号" width="120">
            </el-table-column>
            <el-table-column prop="projectName" label="项目/工程名称|项目工程/代码">
            </el-table-column>
            <el-table-column prop="unit" label="建设单位" width="140">
            </el-table-column>
            <el-table-column prop="approval" label="审批层级" width="80">
            </el-table-column>

            <el-table-column prop="stageName" label="阶段|事项|辅线名称" width="auto">
              <template slot-scope="scope">
                <img src="/img/project.png" alt="" style="width: 100%;height: 30px;">
              </template>
            </el-table-column>
            <el-table-column prop="time" label="申报时间" width="160">
            </el-table-column>
            <el-table-column prop="endtime" label="到达时间" width="160">
            </el-table-column>
            <el-table-column prop="curStage" label="当前环节名称" width="168">
            </el-table-column>
            <el-table-column prop="startTime" label="环节开始计时时间" width="160">
              <template slot-scope="scope">
                <span v-if="scope.row.startTime"> {{scope.row.startTime}}</span>

                <span v-else><span>未开始计时</span>
                  <el-tooltip class="item" effect="dark" placement="right">
                    <div slot="content">
                      <div style="color: yellow;font-size: 14px;margin-bottom: 4px;">未开始计时</div>
                      <div>待部门给出全部处理意见开始计时<br />请于计时开始0.5工作日后开始办理</div>
                    </div>
                    <i class="el-icon-question" style="margin-left: 4px;"></i>
                  </el-tooltip></span>

              </template>
            </el-table-column>
            <el-table-column prop="startPromiseTime" label="环节承诺办结时间" width="160">
            </el-table-column>
            <el-table-column prop="leastTime" label="环节剩余时限" width="120">
              <template slot-scope="scope">
                <span v-if="scope.row.leastTime>0" style="color: #409EFF;"> <el-button size="mini"
                    type="success">剩余{{scope.row.leastTime}}天</el-button></span>
                <span v-else-if="scope.row.leastTime==0" style="color: #409EFF;"> <el-button size="mini"
                    type="warning">剩余{{scope.row.leastTime}}天</el-button></span>
                <span v-else-if="scope.row.leastTime<0" style="color: #409EFF;"> <el-button size="mini"
                    type="danger">逾期{{Math.abs(scope.row.leastTime)}}天</el-button></span>
                <span v-else> {{scope.row.leastTime}}</span>

              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作" width="50">
              <template slot-scope="scope">
                <span style="color: #409EFF;"> 办理</span>
              </template>
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
          radio: '全部',
          keyWord: '',
        },
        show: false,
        tableData: [{
          type: '并行',
          number: '202305201000',
          projectName: '一环公路K8 +400至k8+500段右侧增设（KS-324864324238）',
          unit: '佛山南海区大沥镇',
          approval: '祖庙街道',
          time: '2023-05-20 10：00',
          endtime: '2023-05-20 10：00',
          curStage: '综合受理（窗口受理）',
          startTime: '',
          startPromiseTime: '2023-05-23 10：00',
          leastTime: '-',
        }, {
          type: '并行',
          number: '202305201000',
          projectName: '一环公路K8 +400至k8+500段右侧增设（KS-324864324238）',
          unit: '佛山南海区大沥镇',
          approval: '祖庙街道',
          time: '2023-05-20 10：00',
          endtime: '2023-05-20 10：00',
          curStage: '综合受理（窗口受理）',
          startTime: '2023-05-23 10：00',
          startPromiseTime: '2023-05-23 10：00',
          leastTime: 10,
        }, {
          type: '并行',
          number: '202305201000',
          projectName: '一环公路K8 +400至k8+500段右侧增设（KS-324864324238）',
          unit: '佛山南海区大沥镇',
          approval: '祖庙街道',
          time: '2023-05-20 10：00',
          endtime: '2023-05-20 10：00',
          curStage: '综合受理（窗口受理）',
          startTime: '2023-05-23 10：00',
          startPromiseTime: '2023-05-23 10：00',
          leastTime: 0,
        }
          , {
          type: '并行',
          number: '202305201000',
          projectName: '一环公路K8 +400至k8+500段右侧增设（KS-324864324238）',
          unit: '佛山南海区大沥镇',
          approval: '祖庙街道',
          time: '2023-05-20 10：00',
          endtime: '2023-05-20 10：00',
          curStage: '综合受理（窗口受理）',
          startTime: '2023-05-23 10：00',
          startPromiseTime: '2023-05-23 10：00',
          leastTime: -1,
        }],

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

    .content-table-warp {
      margin-top: 16px;
      height: 100%;
      width: calc(100% - 0px);
    }

  }

  ::v-deep .el-input-group__append {
    background: #409EFF !important;
    color: #fff;
  }

  ::v-deep tr th {
    color: #000;
    opacity: 0.8;
    background: #F5F7FA !important;
  }



  ::v-deep .el-button--warning {
    /* color: #E6A23C; */
    /* background-color: #E6A23C; */
    border-color: #E6A23C;
    color: #E6A23C;
    background: none;
  }

  ::v-deep .el-button--success {
    /* color: #67C23A; */
    /* background-color: #E6A23C; */
    border-color: #67C23A;
    color: #67C23A;
    background: none;
  }

  ::v-deep .el-button--danger {
    color: #FFF;
    /* background-color: #E6A23C; */
    border-color: #F56C6C;
    color: #F56C6C;
    background: none;
  }
</style>