<template>
  <div class="app-container">
    <div class="sun-content">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:systemConfig:sysOuter:add']"
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
            v-hasPermi="['system:systemConfig:sysOuter:edit']"
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
            v-hasPermi="['system:systemConfig:sysOuter:delete']"
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
        <el-table-column label="系统号"  align="center" prop="systemId" />
        <el-table-column label="系统名称" align="center" prop="systemName" />
        <el-table-column label="档案类型" align="center" prop="fileType" />
        <el-table-column label="项类型" align="center" prop="modelCode"/>
        <el-table-column label="影像类型平台" align="center" prop="imageType" :formatter="formatImgType"/>
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
          <el-form-item label="系统号" prop="systemId">
            <el-input v-model="dialog.form.systemId" />
          </el-form-item>
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="dialog.form.systemName" ></el-input>
          </el-form-item>
          <el-form-item label="档案类型" prop="fileType">
            <el-input v-model="dialog.form.fileType" />
          </el-form-item>
          <el-form-item label="项类型" prop="modelCode">
            <el-input v-model="dialog.form.modelCode" />
          </el-form-item>
          <el-form-item label="影像平台类型" prop="imageType">
            <el-select
              v-model="dialog.form.imageType"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_image_type"
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
import { outerList,addOuterList,updateOuterList,delOuterList} from "@/api/system/systemConfig/sysOuter.js";
export default {
  name: "SysOuter",// 账户资料外系统配置
  dicts: ["sys_image_type",],// 数据字典-系统来源类型
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中id数组
      outerIdList: [],
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
          systemId: "",
          systemName: "",
          fileType: "",
          imageType: "",
          modelCode: "",
        },
        rules:{
          systemId: [
            { required: true, message: '此处不得为空', trigger: 'blur' },
          ],
          systemName: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          fileType: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          imageType: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
          modelCode: [
            { required: true, message: '此处不得为空', trigger: 'blur' }
          ],
        },
      },
      // 查询参数
      queryParams: {
        current: 1,
        size: 10,
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    formatImgType(row, column, cellValue) {
      if (cellValue === '0') {
        return '老影像平台';
      }else if(cellValue === '1'){
        return '非结构化数据平台'
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
        "current":this.queryParams.current,
        "size":this.queryParams.size
      }
      outerList(msg).then(response => {
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
        systemId: "",
        systemName: "",
        fileType: "",
        imageType: "",
        modelCode: "",
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.outerIdList = selection.map(item => item.id)
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
      console.log(this.outerIdList,'del');
      let delMsg = {
       "idList": this.outerIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delOuterList(delMsg);
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
        systemId: this.row[0].systemId,
        systemName: this.row[0].systemName,
        fileType: this.row[0].fileType,
        imageType: this.row[0].imageType,
        modelCode: this.row[0].modelCode,
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
              systemId: this.dialog.form.systemId,
              systemName: this.dialog.form.systemName,
              fileType: this.dialog.form.fileType,
              imageType: this.dialog.form.imageType,
              modelCode: this.dialog.form.modelCode,
            }
            updateOuterList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else { // 新增接口
            let msg = {
              systemId: this.dialog.form.systemId,
              systemName: this.dialog.form.systemName,
              fileType: this.dialog.form.fileType,
              imageType: this.dialog.form.imageType,
              modelCode: this.dialog.form.modelCode,
            }
            addOuterList(msg).then(response => {
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