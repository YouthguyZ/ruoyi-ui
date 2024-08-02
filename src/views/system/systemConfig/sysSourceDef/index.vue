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
        <el-form-item label="系统来源描述" prop="dataDesc">
          <el-input
            v-model="queryParams.dataDesc"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
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
            v-hasPermi="['system:systemConfig:sysSourceDef:add']"
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
            v-hasPermi="['system:systemConfig:sysSourceDef:edit']"
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
            v-hasPermi="['system:systemConfig:sysSourceDef:delete']"
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
        <el-table-column label="系统来源ID"  align="center" prop="dataSourceId" />
        <el-table-column label="来源类型" align="center" prop="dataSourceType" :formatter="formatId"/>
        <el-table-column label="服务器组名" align="center" prop="groupName" />
        <el-table-column label="索引对象" align="center" prop="modeCode"/>
        <el-table-column label="文档对象" align="center" prop="filePartName" />
        <el-table-column label="分表字段" align="center" prop="indexName" />
        <el-table-column label="控件客户号" align="center" prop="custId" />
        <el-table-column label="系统来源描述" align="center" prop="dataDesc" />
        <el-table-column label="服务ID" align="center" prop="serviceId" />
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
        <el-form ref="form" :model="dialog.form" :rules="dialog.rules" label-width="100px">
          <el-form-item label="来源类型" prop="dataSourceType">
           <el-select
              v-model="dialog.form.dataSourceType"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_source_def"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="服务器组名" prop="groupName">
            <el-input v-model="dialog.form.groupName" />
          </el-form-item>
          <el-form-item label="索引对象" prop="modeCode">
            <el-input v-model="dialog.form.modeCode" ></el-input>
          </el-form-item>
          <el-form-item label="文档对象" prop="filePartName">
            <el-input v-model="dialog.form.filePartName" />
          </el-form-item>
          <el-form-item label="分表字段" prop="indexName">
            <el-input v-model="dialog.form.indexName" />
          </el-form-item>
          <el-form-item label="控件客户号" prop="custId">
            <el-input v-model="dialog.form.custId" />
          </el-form-item>
          <el-form-item label="系统来源描述" prop="dataDesc">
            <el-input v-model="dialog.form.dataDesc" />
          </el-form-item>
          <el-form-item label="服务ID" prop="serviceId">
            <el-select
              v-model="dialog.form.serviceId"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in serviceIds"
                :key="dict.value"
                :label="dict.name"
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
import { serviceIdQuery,dataSourcelist,addSourceList,updateSourceList,delSourceList} from "@/api/system/systemConfig/sysSourceDef.js";
export default {
  name: "SysSourceDef",
  dicts: ["sys_source_def"],// 数据字典-系统来源类型
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中系统来源id数组
      dataSourceIdList: [],
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
          dataSourceType:'',
          groupName:'',
          modeCode:'',
          filePartName:'',
          indexName:'',
          custId:'',
          dataDesc:'',
          serviceId:'',
        },
        rules:{
          dataSourceType: [
            { required: true, message: '此处不得为空', trigger: 'change' },
          ],
          groupName: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          modeCode: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          filePartName: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          indexName: [
            { required: true, message: '此处不得为空', trigger: 'blur' },
          ],
          custId: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],

          // dataDesc: [
          //   { required: true, message: '此处不得为空', trigger: 'blur' }
          // ],
          // serviceId: [
          //   { required: true, message: '此处不得为空', trigger: 'change' }
          // ],
        },
      },
      queryParams: {
        currentPage: 1,
        pageSize: 30,
        dataDesc:''
      }
    };
  },

  created() {
    this.serviceIdQ()
    this.getList();
  },

  methods: {
    formatId(row, column, cellValue, index) {
      if (cellValue === '1') {
        return '1-外系统';
      }else if(cellValue === '0'){
        return '0-本系统'
      }
      return cellValue;
    },
    // 获取服务id
    serviceIdQ(){
      let msg ={}
      this.serviceIds = []
      serviceIdQuery(msg).then(res=>{
        if(res.code === 200){
          let dataList = res.data
          for (let index = 0; index < dataList.length; index++) {
            this.serviceIds.push({
              value:dataList[index].serviceId,
              name:dataList[index].serviceId + '-'+ dataList[index].serviceName
            })
          } 
        }else{
          this.$modal.msgError(res.msg)
        }
      })
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
        "parameterList":[{
          "dataDesc":this.queryParams.dataDesc,
        }],
        "sysMap":{
          "currentPage":1,
          "pageSize":10
        }
      }
      dataSourcelist(msg).then(response => {
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
        dataSourceType:'',
        groupName:'',
        modeCode:'',
        filePartName:'',
        indexName:'',
        custId:'',
        dataDesc:'',
        serviceId:'',
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.dataSourceIdList = selection.map(item => item.dataSourceId)
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
      this.dialog.open = true
      this.dialog.title = "新增";
    },
    
    /** 删除按钮操作 */
    handleDelete() {
      console.log(this.dataSourceIdList,'del');
      let delMsg = {
       "dataSourceIdList": this.dataSourceIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delSourceList(delMsg);
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
        dataSourceId:this.row[0].dataSourceId,
        groupName:this.row[0].groupName,
        modeCode:this.row[0].modeCode,
        indexName:this.row[0].indexName,
        filePartName:this.row[0].filePartName,
        dataDesc:this.row[0].dataDesc,
        custId:this.row[0].custId,
        serviceId:this.row[0].serviceId,
        dataSourceType:this.row[0].dataSourceType,
      }
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
              parameterList:[{
                dataSourceId:this.dialog.form.dataSourceId,
                groupName:this.dialog.form.groupName,
                modeCode:this.dialog.form.modeCode,
                indexName:this.dialog.form.indexName,
                filePartName:this.dialog.form.filePartName,
                dataDesc:this.dialog.form.dataDesc,
                custId:this.dialog.form.custId,
                serviceId:this.dialog.form.serviceId,
                dataSourceType:this.dialog.form.dataSourceType,
              }],
            }
            updateSourceList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else { // 新增接口
            let msg = {
              parameterList:[{
                groupName:this.dialog.form.groupName,
                modeCode:this.dialog.form.modeCode,
                indexName:this.dialog.form.indexName,
                filePartName:this.dialog.form.filePartName,
                dataDesc:this.dialog.form.dataDesc,
                custId:this.dialog.form.custId,
                serviceId:this.dialog.form.serviceId,
                dataSourceType:this.dialog.form.dataSourceType,
              }],
            }
            addSourceList(msg).then(response => {
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