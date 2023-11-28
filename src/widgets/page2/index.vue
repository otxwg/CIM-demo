<template>
  <div class="container">
    <div class="content">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="办结日期">
          <el-date-picker v-model="formInline.time" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="formInline.type" placeholder="全部类型">
            <el-option label="全部类型" value="全部类型"></el-option>
            <el-option label="项目类型1" value="项目类型1"></el-option>
            <el-option label="项目类型2" value="项目类型2"></el-option>
          </el-select>

        </el-form-item>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="formInline.keyword" placeholder="关键字" style="width: 400px;"> <el-button slot="append"
              icon="el-icon-search" type="primary">查询</el-button></el-input>
        </el-form-item>
        <el-form-item label="行政区划">
          <el-select v-model="formInline.region" placeholder="全部">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <div style="color: #409EFF;cursor: pointer;margin-right: 10px;"><span @click="show=!show">高级查询</span>
            <i v-if="show" class="el-icon-arrow-down"></i>
            <i v-else class="el-icon-arrow-up"></i>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">导出</el-button>
          <el-button>重置</el-button>
        </el-form-item>
        <el-form-item label="申报阶段">
          <el-checkbox-group v-model="formInline.stageList">
            <el-checkbox label='立项用地阶段'></el-checkbox>
            <el-checkbox label="工程建设阶段"></el-checkbox>
            <el-checkbox label="施工许可阶段"></el-checkbox>
            <el-checkbox label="竣工验收阶段"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>



      </el-form>
      <div class="line"></div>
      <div class="content-table">
        <div><span class="content-table-title">按项目统计申报用时</span><span class="content-table-subtitle">截止于2023-10-23 10:00
            共申报项目2300个</span></div>
        <div class="content-table-warp">
          <el-table :data="tableData" border style="width: 100%;">
            <el-table-column prop="projectName" label="项目/工程名称|项目工程/代码" width="auto">
            </el-table-column>
            <el-table-column prop="projectType" label="项目类型" width="auto">
            </el-table-column>
            <el-table-column prop="region" label="行政区划" width="100">
            </el-table-column>
            <el-table-column class="column" prop="stageName" label="阶段名称" width="240">
              <template slot-scope="scope">
               <div class="column-cell" v-for="item in scope.row.stageName">
                 <span style="padding-left: 8px;"> {{item}}</span>
              </div>
              </template>
            </el-table-column>
            <el-table-column prop="day" label="审批用时（工作日）" width="150">
              <template slot-scope="scope">
                <div class="column-cell" v-for="item in scope.row.day">
                  <span style="padding-left: 8px;"> {{item}}</span>
               </div>
               </template>
            </el-table-column>
            <el-table-column prop="nDay" label="审批用时（自然日）" width="150">
              <template slot-scope="scope">
                <div class="column-cell" v-for="item in scope.row.nDay">
                  <span style="padding-left: 8px;"> {{item}}</span>
               </div>
               </template>
            </el-table-column>
            <el-table-column prop="time" label="第一次申报日期" width="140">
              <template slot-scope="scope">
                <div class="column-cell" v-for="item in scope.row.time">
                  <span style="padding-left: 8px;"> {{item}}</span>
               </div>
               </template>
            </el-table-column>
            <el-table-column prop="ntime" label="最后一次办结日期" width="140">
               <template slot-scope="scope">
                <div class="column-cell" v-for="item in scope.row.time">
                  <span style="padding-left: 8px;"> {{item}}</span>
               </div>
               </template>
            </el-table-column>
          </el-table>
          <el-pagination class="pagination"    background @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="10"
            layout="total, prev, pager, next, jumper, sizes" :total="100">
          </el-pagination>
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
          user: '',
          region: '',
          stageList: ['立项用地阶段']
        },
        show: false,
        tableData: [{
          projectName: '海高智能电气建设制造项目',
          projectCode: '2023-052233-0334254-776',
          projectType: '政府投资工程建设项目（1000万以上房屋建筑项目）',
          region: '市级',
          stageName: ['立项用地阶段', '工程建设阶段', '施工许可阶段', '竣工验收阶段'],
          day: ['5', '5', '5', '5'],
          nDay: ['6', '6', '6', '6'],
          time: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],
          ntime: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],

        },{
          projectName: '海高智能电气建设制造项目',
          projectCode: '2023-052233-0334254-776',
          projectType: '政府投资工程建设项目（1000万以上房屋建筑项目）',
          region: '市级',
          stageName: ['立项用地阶段', '工程建设阶段', '施工许可阶段', '竣工验收阶段'],
          day: ['5', '5', '5', '5'],
          nDay: ['6', '6', '6', '6'],
          time: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],
          ntime: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],
        }, {
          projectName: '海高智能电气建设制造项目',
          projectCode: '2023-052233-0334254-776',
          projectType: '政府投资工程建设项目（1000万以上房屋建筑项目）',
          region: '市级',
          stageName: ['立项用地阶段', '工程建设阶段', '施工许可阶段', '竣工验收阶段'],
          day: ['5', '5', '5', '5'],
          nDay: ['6', '6', '6', '6'],
          time: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],
          ntime: ['2023-05-03', '2023-05-03', '2023-05-03', '2023-05-03'],
        }],
        currentPage: 1
      };
    },
    created() { },
    mounted() {

    },
    destroyed() {

    },
    methods: {
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      }
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

  .pagination {
    position: absolute;
    right: -4px;
    margin-top: 16px;
  }
  .column-cell{
    height: 48px;
    line-height: 48px;
    border-bottom: 1px solid #d3d3d3d3;
  }
  ::v-deep .el-input-group__append {
    background: #409EFF !important;
    color: #fff;
  }
   /* tr */
   ::v-deep .el-table__row :nth-child(4){
      /* border: 2px solid blue; */
      padding: 0;
      .cell{
        padding: 0;
      }
    }
    ::v-deep .el-table__row :nth-child(5){
      /* border: 2px solid blue; */
      padding: 0;
      .cell{
        padding: 0;
      }
    }
    ::v-deep .el-table__row :nth-child(6){
      /* border: 2px solid blue; */
      padding: 0;
      .cell{
        padding: 0;
      }
    }
    ::v-deep .el-table__row :nth-child(7){
      /* border: 2px solid blue; */
      padding: 0;
      .cell{
        padding: 0;
      }
    }
    ::v-deep .el-table__row :nth-child(8){
      /* border: 2px solid blue; */
      padding: 0;
      .cell{
        padding: 0;
      }
    }
    ::v-deep tr th{
      color: #000;
      opacity: 0.8;
    }
</style>