<template>
  <div class="app-container">
    <!-- -->
    <div class="sun-content">
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
      >
        <el-form-item label="系统编号" prop="sysId">
          <el-input
            v-model="queryParams.sysId"
            placeholder="请输入系统编号"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="交易代码" prop="tradeCode">
          <el-input
            v-model="queryParams.tradeCode"
            placeholder="请输入交易代码"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="搜索日期范围">
          <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="sun-content">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:systemConfig:attachment:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            @click="handleModify"
            v-hasPermi="['system:systemConfig:attachment:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:systemConfig:attachment:delete']"
          >删除</el-button>
        </el-col>
        <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
      </el-row>

      <el-table
        ref="tables"
        v-loading="loading"
        :data="list"
        style="width: 100%" height="480px"
        @selection-change="handleSelectionChange"
        @row-click="clickRow"
        :default-sort="defaultSort"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="交易代码" width="80" align="center" prop="tradeCode" />
        <el-table-column
          label="交易名称"
          align="center"
          prop="tradeName"
        />
        <el-table-column
          label="系统编号"
          align="center"
          prop="sysId"
          width="130"
        />
        <el-table-column label="系统名称" align="center" prop="sysName"/>
        <el-table-column label="最低附件张数" align="center" prop="mininumbers" />
        <el-table-column label="创建机构号" align="center" prop="crateBrno" />
        <el-table-column label="创建柜员号" align="center" prop="createUser" />
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="重控凭证" align="center" prop="duplicateblankvoucher" />
        <el-table-column label="附件类型" align="center" prop="accessoryType" />
        <el-table-column label="更新机构号" align="center" prop="updateBrno" />
        <el-table-column label="更新柜员号" align="center" prop="updateUser" />
        <el-table-column label="更新时间" align="center" prop="updateTime" />
        <el-table-column label="是否必打" align="center" prop="isbida" />
        <el-table-column label="备注" align="center" prop="note" />
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.current"
        :limit.sync="queryParams.size"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
// import TableList from "./component/table/index.vue";
import { list, deleteList } from "@/api/system/systemConfig/attachment.js";
export default {
  name: "attachment",
  // components: {
  //   TableList
  // },
  dicts: ["sys_common_status"],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中系统编号数组
      sysIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: "",
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: {prop: 'accessTime', order: 'descending'},
      queryParams: {
        current: 1,
        size: 30,
        sysId: '',
        tradeCode: '',
        beginTime:'',
        endTime:''
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    formatDate(queryParams,dateRange){
      if(dateRange.length==0){
        return queryParams
      }else{
        queryParams.beginTime = dateRange[0]
        queryParams.endTime = dateRange[1]
        return queryParams
      }
    },
    // 当行数据选中
    clickRow(row){
      this.$refs.tables.toggleRowSelection(row);
    },
    /** 查询登录日志列表 */
    getList() {
      console.log(this.dateRange,'this.dateRange');
      this.loading = true;
      list(this.formatDate(this.queryParams,this.dateRange)).then(response => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getList();
    },
    /**
     * 重置
     */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.current = 1;
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
    },
    handleAdd(){
      
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.sysIds = selection.map(item => item.sysId)
      this.single = selection.length!=1
      this.multiple = !selection.length
      // this.selectName = selection.map(item => item.tradecode);
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete() {
      if(this.sysIds.length===0){
        return this.$modal.msgError("未选中数据！");
      }
      const sysIds = {
       sysIdDEl:this.sysIds
      };
      this.$modal.confirm('是否确认删除此数据？')
      .then(function(){
        return deleteList(sysIds);
      })
      .then(()=>{
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
      .catch((error)=>{
        // 记录错误以便调试
        console.error("删除失败：", error);
        // 可选：向用户显示错误消息
        this.$modal.msgError("删除失败");
      })
    },
    /** 导出按钮操作 */
    handleModify() {
      
    }
  }
};
</script>