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
        <el-form-item label="系统名称" prop="sysName">
          <el-input
            v-model="queryParams.sysName"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="凭证种类" prop="voucherType">
          <el-input
            v-model="queryParams.voucherType"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="二维码上边距" prop="locationX">
          <el-input 
            v-model="queryParams.locationX" 
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="二维码左边距" prop="locationY">
          <el-input 
            v-model="queryParams.locationY" 
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="搜索日期范围">
          <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyyMMdd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
            v-hasPermi="['system:systemConfig:qrCodeConfig:add']"
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
            v-hasPermi="['system:systemConfig:qrCodeConfig:edit']"
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
            v-hasPermi="['system:systemConfig:qrCodeConfig:delete']"
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
        <el-table-column label="凭证种类"  align="center" prop="voucherType" />
        <el-table-column label="打印二维码位置" align="center" prop="location" />
        <el-table-column label="创建机构号" align="center" prop="createBrno" />
        <el-table-column label="创建柜员号" align="center" prop="createUser"/>
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="更新机构号" align="center" prop="updateBrno" />
        <el-table-column label="更新柜员号" align="center" prop="updateUser" />
        <el-table-column label="更新时间" align="center" prop="updateTime" />
        <el-table-column label="系统编号" align="center" prop="sysId" />
        <el-table-column label="系统名称" align="center" prop="sysName" />
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
          <el-form-item label="凭证种类" prop="voucherType">
            <el-input v-model="dialog.form.voucherType" />
          </el-form-item>
          <el-form-item label="二维码上边距" prop="locationX">
            <el-input v-model="dialog.form.locationX" ></el-input>
          </el-form-item>
          <el-form-item label="二维码左边距" prop="locationY">
           <el-input v-model="dialog.form.locationY" />
          </el-form-item>
          <el-form-item label="系统编号" prop="sysId">
            <el-input v-model="dialog.form.sysId" />
          </el-form-item>
          <el-form-item label="系统名称" prop="sysName">
            <el-input v-model="dialog.form.sysName" />
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
import { qrCodeList,addqrCodeList,updateqrCodeList,delqrCodeList} from "@/api/system/systemConfig/qrCodeConfig.js";
export default {
  name: "QrCodeConfig",// 账户资料外系统配置
  dicts: ["sys_account_dataflag","sys_account_acctflag","sys_account_enableflag"],// 数据字典-系统来源类型
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中id数组
      qrIdList: [],
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
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: {prop: 'accessTime', order: 'descending'},
      dialog:{
        open:false,
        title:'',
        disabled:true,
        form:{
          sysId: "",
          sysName: "",
          voucherType: "",
          locationX: "",
          locationY:"",
        },
        rules:{
          sysId: [
            { required: true, message: '此处不得为空', trigger: 'blur' },
          ],
          sysName: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          voucherType: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          locationX: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          locationY: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
        },
      },
      // 查询参数
      queryParams: {
        current: 1,
        size: 10,
        sysName:"",
        voucherType:"",
        locationx:"",
        locationy:"",
        beginTime:"", // this.dateRange[0]?this.dateRange[0]:
        endTime:"" // this.dateRange[1]?this.dateRange[1]:
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
    // 单行数据选中
    clickRow(row){
      this.$refs.tables.toggleRowSelection(row);
      console.log(row,'row');
    },
    /** 查询服务注册数据 */
    getList() {
      console.log(this.dateRange,'daterange');
      this.loading = true;
      let msg = {
        "sysName":this.queryParams.sysName,
        "voucherType":this.queryParams.voucherType,
        "locationx":this.queryParams.locationx,
        "locationy":this.queryParams.locationy,
        "beginTime":this.queryParams.beginTime,
        "endTime":this.queryParams.endTime,
        "current":this.queryParams.current,
        "size":this.queryParams.size
      }
      qrCodeList(msg).then(response => {
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
        sysId: "",
        sysName: "",
        voucherType: "",
        locationX: "",
        locationY:"",
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.qrIdList = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      // this.queryParams.orderByColumn = column.prop;
      // this.queryParams.isAsc = column.order;
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
      console.log(this.qrIdList,'del');
      let delMsg = {
       "idList": this.qrIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delqrCodeList(delMsg);
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
        sysId: this.row[0].sysId,
        sysName: this.row[0].sysName,
        voucherType: this.row[0].voucherType,
        locationX: this.row[0].location.split('|')[0],
        locationY:this.row[0].location.split('|')[1],
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
              id:this.row[0].id,
              sysId: this.dialog.form.sysId,
              sysName: this.dialog.form.sysName,
              voucherType: this.dialog.form.voucherType,
              locationX: this.dialog.form.locationX,
              locationY:this.dialog.form.locationY,
            }
            updateqrCodeList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else { // 新增接口
            let msg = {
              sysId: this.dialog.form.sysId,
              sysName: this.dialog.form.sysName,
              voucherType: this.dialog.form.voucherType,
              locationX: this.dialog.form.locationX,
              locationY:this.dialog.form.locationY,
            }
            addqrCodeList(msg).then(response => {
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