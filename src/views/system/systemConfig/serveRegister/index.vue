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
        <el-form-item label="机器名称" prop="serviceName">
          <el-input
            v-model="queryParams.serviceName"
            placeholder="请输入机器名称"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="机器IP" prop="serviceIp">
          <el-input
            v-model="queryParams.serviceIp"
            placeholder="请输入机器IP"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="服务类型" prop="serviceType">
          <el-select
            v-model="queryParams.serviceType"
            placeholder="选择服务类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in dict.type.sys_serve_register"
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
            v-hasPermi="['system:systemConfig:serveRegister:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleModify"
            v-hasPermi="['system:systemConfig:serveRegister:edit']"
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
            v-hasPermi="['system:systemConfig:serveRegister:delete']"
          >删除</el-button>
        </el-col>
        
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
        <el-table-column label="服务ID" width="80" align="center" prop="serviceId" />
        <el-table-column label="机器名称" align="center" prop="serviceName"/>
        <el-table-column label="机器IP" align="center" prop="serviceIp" width="130"/>
        <el-table-column label="端口号" align="center" prop="servicePort"/>
        <el-table-column label="服务类型" align="center" prop="serviceType" />
        <el-table-column label="用户名" align="center" prop="loginName" />
        <el-table-column label="密码" align="center" prop="loginPass" />
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
        <el-form ref="form" :model="dialog.form" :rules="dialog.rules" label-width="80px">
          <el-form-item label="机器名称" prop="serviceName">
            <el-input v-model="dialog.form.serviceName" placeholder="请输入机器名称" />
          </el-form-item>
          <el-form-item label="机器IP" prop="serviceIp">
            <el-input v-model="dialog.form.serviceIp" placeholder="请输入机器IP" />
          </el-form-item>
          <el-form-item label="端口号" prop="servicePort">
            <el-input v-model="dialog.form.servicePort" placeholder="请输入端口号"></el-input>
          </el-form-item>
          <el-form-item label="服务类型" prop="serviceType">
            <!-- <el-input v-model="dialog.form.serviceType" placeholder="请输服务类型"></el-input> -->
            <el-select
              v-model="dialog.form.serviceType"
              placeholder="请输入服务类型"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_serve_register"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户名" prop="loginName">
            <el-input v-model="dialog.form.loginName" placeholder="请输用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="loginPass">
            <el-input type="password" v-model="dialog.form.loginPass" placeholder="请输密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="服务ID" prop="serviceId">
            <el-input v-model="dialog.form.serviceId" placeholder="请输服务ID" disabled></el-input>
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
import { servelist,addServeList,modifyServeList,delServeList} from "@/api/system/systemConfig/serveRegister.js";
export default {
  name: "ServeRegister",
  dicts: ["sys_serve_register"],// 数据字典-服务类型
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中服务id数组
      serviceIdList: [],
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
      // 默认排序
      defaultSort: {prop: 'accessTime', order: 'descending'},
      dialog:{
        open:false,
        title:'',
        disabled:true,
        form:{
          serviceName:'',
          serviceIp:'',
          servicePort:'',
          serviceType:'',
          loginName:'',
          loginPass:'',
          serviceId:'',
        },
        rules:{
          serviceName: [
            { required: true, message: '此处不得为空', trigger: 'blur' },
            // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
          serviceIp: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          servicePort: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          serviceType: [
            { required: true, message: '此处不得为空', trigger: 'change' }
          ],
        },
      },
      queryParams: {
        current: 1,
        size: 30,
        serviceName: '',
        serviceIp: '',
        serviceType:'',
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
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
          "serviceName":this.queryParams.serviceName,
          "serviceIp":this.queryParams.serviceIp,
          "serviceType":this.queryParams.serviceType
        }],
        "sysMap":{
          "currentPage":1,
          "pageSize":10
        }
      }
      servelist(msg).then(response => {
        if(response.code === 200){
          console.log(response,'res');
          this.list = response.data.records;
          this.total = response.data.total;
          this.loading = false;
        }else{
          
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
                serviceName:this.dialog.form.serviceName,
                serviceIp:this.dialog.form.serviceIp,
                servicePort:this.dialog.form.servicePort,
                serviceType:this.dialog.form.serviceType,
                loginName:this.dialog.form.loginName,
                loginPass:this.dialog.form.loginPass,
                serviceId:this.dialog.form.serviceId,
              }],
            }
            modifyServeList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else {
            let msg = {
              parameterList:[{
                serviceName:this.dialog.form.serviceName,
                serviceIp:this.dialog.form.serviceIp,
                servicePort:this.dialog.form.servicePort,
                serviceType:this.dialog.form.serviceType,
                loginName:this.dialog.form.loginName,
                loginPass:this.dialog.form.loginPass,
                serviceId:this.dialog.form.serviceId,
              }],
              // sysMap:{
                
              // }
            }
            addServeList(msg).then(response => {
              console.log(response,'res');
              this.$modal.msgSuccess("新增成功");
              this.dialog.open = false;
              this.getList();
            });
          }
        }
      });
    },
    // 表单重置
    dialogFormReset() {
      this.dialog.form = {
        serviceName:'',
        serviceIp:'',
        servicePort:'',
        serviceType:'',
        loginName:'',
        loginPass:'',
        serviceId:'',
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.serviceIdList = selection.map(item => item.serviceId)
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
      console.log(this.serviceIdList,'del');
      let delMsg = {
       "serviceIdList": this.serviceIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delServeList(delMsg);
      })
      .then(()=>{
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
      .catch((error)=>{
        // 记录错误以便调试
        // console.error("删除失败：", error);
        // // 可选：向用户显示错误消息
        // this.$modal.msgError("删除失败");
      })
    },
    /** 修改按钮操作 */
    handleModify() {
      this.dialogFormReset()
      this.dialog.form = {
        serviceName:this.row[0].serviceName,
        serviceIp:this.row[0].serviceIp,
        servicePort:this.row[0].servicePort,
        serviceType:this.row[0].serviceType,
        loginName:this.row[0].loginName,
        loginPass:this.row[0].loginPass,
        serviceId:this.row[0].serviceId
      }
      this.dialog.open = true
      this.dialog.title = "修改";
    }
  }
};
</script>