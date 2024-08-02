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
        <el-form-item label="账户资料编号" prop="dataId">
          <el-input
            v-model="queryParams.dataId"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="资料名称" prop="dataName">
          <el-input
            v-model="queryParams.dataName"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="是否有实物" prop="dataFlag">
          <el-select
            v-model="queryParams.dataFlag"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in dict.type.sys_account_dataflag"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对公对私标识" prop="acctFlag">
          <el-select
            v-model="queryParams.acctFlag"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in dict.type.sys_account_acctflag"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
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
            v-hasPermi="['system:systemConfig:sysAccount:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:systemConfig:sysAccount:edit']"
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
            v-hasPermi="['system:systemConfig:sysAccount:delete']"
          >删除</el-button>
        </el-col>
      </el-row>

      <el-table
        ref="tables"
        v-loading="loading"
        :data="list"
        style="width:100%"
        @selection-change="handleSelectionChange"
        @row-click="clickRow"
        :default-sort="defaultSort"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="账户资料编号"  align="center" prop="dataId" />
        <el-table-column label="资料名称" align="center" prop="dataName" />
        <el-table-column label="是否有实物" align="center" prop="dataFlag" :formatter="formatdataFlag"/>
        <el-table-column label="备注" align="center" prop="note"/>
        <el-table-column label="新增修改时间" align="center" prop="updateTime" />
        <el-table-column label="修改柜员" align="center" prop="updateOperId" />
        <el-table-column label="对公对私标识" align="center" prop="acctFlag" :formatter="formatacctFlag"/>
        <el-table-column label="启用标识" align="center" prop="enableFlag" :formatter="formatenableFlag"/>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.current"
        :limit.sync="queryParams.size"
        @pagination="getList"
      />
      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="dialog.title" :visible.sync="dialog.open" width="500px" center append-to-body>
        <el-form ref="form" :model="dialog.form" :rules="dialog.rules" label-width="110px">
          <el-form-item label="账户资料编号" prop="dataId">
            <el-input v-model="dialog.form.dataId" :disabled="useFlag"/>
          </el-form-item>
          <el-form-item label="资料名称" prop="dataName">
            <el-input v-model="dialog.form.dataName" ></el-input>
          </el-form-item>
          <el-form-item label="是否有实物" prop="dataFlag">
           <el-select
              v-model="dialog.form.dataFlag"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_account_dataflag"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="note">
            <el-input v-model="dialog.form.note" />
          </el-form-item>
          <!-- <el-form-item label="新增修改时间" prop="updateTime">
            <el-input v-model="dialog.form.updateTime" display="none"/>
          </el-form-item> -->
          <el-form-item label="修改柜员" prop="updateOperId">
            <el-input v-model="dialog.form.updateOperId" />
          </el-form-item>
          <el-form-item label="对公对私标识" prop="acctFlag">
            <el-select
              v-model="dialog.form.acctFlag"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_account_acctflag"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="启用标识" prop="enableFlag">
            <el-select
              v-model="dialog.form.enableFlag"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_account_enableflag"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { accountlist,addAccountList,updateAccountList,delAccountList} from "@/api/system/systemConfig/sysAccount.js";
export default {
  name: "SysAccount",// 账户资料外系统配置
  dicts: ["sys_account_dataflag","sys_account_acctflag","sys_account_enableflag"],// 数据字典-系统来源类型
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中id数组
      acctIdList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 账户资料编号不可修改 
      useFlag:false,
      // 选择用户名
      selectName: "",
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 选中行数据
      row:[],
      // 服务ID
      serviceIds:[],
      // 默认排序
      defaultSort: {prop: 'accessTime', order: 'descending'},
      dialog:{
        open:false,
        title:'',
        disabled:true,
        form:{
          dataId: "",
          dataName: "",
          dataFlag: "",
          note: "",
          updateTime: "",
          updateOperId: "",
          acctFlag: "",
          enableFlag: ""
        },
        rules:{
          dataId: [
            { required: true, message: '此处不得为空', trigger: 'blur' },
          ],
          dataName: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
        },
      },
      // 查询参数
      queryParams: {
        current: 1,
        size: 10,
        dataId:"",
        dataName:"",
        dataFlag:"",
        acctFlag:"",
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    formatdataFlag(row, column, cellValue) {
      if (cellValue === '1') {
        return '1-否';
      }else if(cellValue === '2'){
        return '2-是'
      }
      return cellValue;
    },
    formatacctFlag(row, column, cellValue) {
      if (cellValue === '1') {
        return '1-对公';
      }else if(cellValue === '2'){
        return '2-对私'
      }
      return cellValue;
    },
    formatenableFlag(row, column, cellValue) {
      if (cellValue === '1') {
        return '1-启用';
      }else if(cellValue === '2'){
        return '2-不启用'
      }
      return cellValue;
    },
    // 单行数据选中
    clickRow(row){
      this.$refs.tables.toggleRowSelection(row);
      console.log(row,'row');
    },
    /** 查询服务注册数据 */
    getList() {
      this.loading = true;
      let msg = {
        "dataId":this.queryParams.dataId,
        "dataName":this.queryParams.dataName,
        "dataFlag":this.queryParams.dataFlag,
        "current":this.queryParams.current,
        "size":this.queryParams.size
      }
      accountlist(msg).then(response => {
        if(response.code === 200){
          console.log(response,'res');
          this.list = response.data.records;
          this.total = response.data.total;
          this.loading = false;
        }else{
          this.$modal.msgError(response.msg)
          this.loading = false;
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // this.queryParams.current = 1;
      this.getList();
    },
    /**
     * 重置
     */
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.getList()
    },
    // 弹框表单重置
    dialogFormReset() {
      this.dialog.form = {
        dataId: "",
        dataName: "",
        dataFlag: "",
        note: "",
        updateTime: "",
        updateOperId: "",
        acctFlag: "",
        enableFlag: ""
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.acctIdList = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /**
     * @description 新增弹框数据
     * @param {}
     */
    handleAdd(){
      this.dialogFormReset()
      this.useFlag = false,
      this.dialog.open = true
      this.dialog.title = "新增";
    },
    
    /** 删除按钮操作 */
    handleDelete() {
      console.log(this.acctIdList,'del');
      let delMsg = {
       "idList": this.acctIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delAccountList(delMsg);
      })
      .then(res=>{
        if(res.code === 200){
          this.getList();
          this.$modal.msgSuccess(res.msg);
        }else{
          this.$modal.msgError(res.msg);
        }
      })
      .catch(()=>{
        // 记录错误以便调试
        // console.error("删除失败：", error);
        // // 可选：向用户显示错误消息
        // this.$modal.msgError("删除失败");
      })
    },
    /** 修改按钮操作 */
    handleUpdate() {
      this.dialogFormReset()
      this.dialog.form = {
        dataId:this.row[0].dataId,
        dataName:this.row[0].dataName,
        dataFlag:this.row[0].dataFlag,
        note:this.row[0].note,
        updateTime:this.row[0].updateTime,
        acctFlag:this.row[0].acctFlag,
        enableFlag:this.row[0].enableFlag,
        updateOperId:this.row[0].updateOperId,
      }
      this.useFlag = true,
      this.dialog.open = true
      this.dialog.title = "修改";
    },
    // 取消按钮
    cancel() {
      this.dialog.open = false;
      this.dialogFormReset();
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.dialog.title !== '新增') {
           let updateMsg = {
              id:this.row[0].id,
              dataId:this.dialog.form.dataId,
              dataName:this.dialog.form.dataName,
              dataFlag:this.dialog.form.dataFlag,
              note:this.dialog.form.note,
              updateTime:this.dialog.form.updateTime,
              acctFlag:this.dialog.form.acctFlag,
              enableFlag:this.dialog.form.enableFlag,
              updateOperId:this.dialog.form.updateOperId,
              
            }
            updateAccountList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else { // 新增接口
            let msg = {
              dataId:this.dialog.form.dataId,
              dataName:this.dialog.form.dataName,
              dataFlag:this.dialog.form.dataFlag,
              note:this.dialog.form.note,
              updateTime:this.dialog.form.updateTime,
              acctFlag:this.dialog.form.acctFlag,
              enableFlag:this.dialog.form.enableFlag,
              updateOperId:this.dialog.form.updateOperId,
            }
            addAccountList(msg).then(response => {
              console.log(response,'res');
              this.$modal.msgSuccess("新增成功");
              this.dialog.open = false;
              this.getList();
            });
          }
        }
      });
    },
  }
};
</script>