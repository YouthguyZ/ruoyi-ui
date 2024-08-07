<template>
  <div class="app-container">
    <div class="sun-content">
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
      >
        <el-form-item label="版面名称" prop="networkService">
          <el-input
            v-model="queryParams.networkService"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="是否存储报文" prop="describe">
          <el-select
            v-model="queryParams.describe"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in dict.type.sys_hehe_config"
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
            v-hasPermi="['system:systemConfig:heheConfig:add']"
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
            v-hasPermi="['system:systemConfig:heheConfig:edit']"
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
            v-hasPermi="['system:systemConfig:heheConfig:delete']"
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
        <el-table-column label="标识ID" width="80" align="center" prop="id" />
        <el-table-column label="版面名称" align="center" prop="networkService"/>
        <el-table-column label="合合地址" align="center" prop="serUrl"/>
        <el-table-column label="是否启用" align="center" prop="isOpen" :formatter="formatisOpenId"/>
        <el-table-column label="是否存储报文" align="center" prop="describe" :formatter="formatDescribe"/>
        <el-table-column label="获取报文字段" align="center" prop="jsonColumn" />
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
          <el-form-item label="版面名称" prop="networkService">
            <el-input v-model="dialog.form.networkService" placeholder="请输入版面名称" />
          </el-form-item>
          <el-form-item label="合合地址" prop="serUrl">
            <el-input v-model="dialog.form.serUrl" placeholder="请输入合合地址" />
          </el-form-item>
          <el-form-item label="是否存储报文" prop="describe">
            <el-select
              v-model="dialog.form.describe"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_hehe_config"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用" prop="isOpen">
            <el-select
              v-model="dialog.form.isOpen"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_hehe_isopen"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="获取报文字段" prop="jsonColumn">
            <el-input v-model="dialog.form.jsonColumn" placeholder="请输入获取报文字段"></el-input>
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
import { heheList,addheheList,updateheheList,delheheList} from "@/api/system/systemConfig/heheConfig.js";
export default {
  name: "HeheConfig",
  dicts: ["sys_hehe_config","sys_hehe_isopen"],// 数据字典-是否存储报文
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中服务id数组
      hehIdList: [],
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
          networkService: "",
          serUrl: "",
          isOpen: "",
          describe: "",
          jsonColumn: ""
        },
        rules:{
          isOpen: [
            { required: true, message: '此处不得为空', trigger: 'change' },
          ],
        },
      },
      queryParams: {
        current: 1,
        size: 30,
        networkService:"",
        describe:"",
      }
    };
  },

  created() {
    this.getList();
  },

  methods: {
    // 映射是否启用
    formatisOpenId(row, column, cellValue, index) {
      if (cellValue === '1') {
        return '1-启用';
      }else if(cellValue === '0'){
        return '0-禁用'
      }
      return cellValue;
    },
    // 映射是否存储报文
    formatDescribe(row, column, cellValue, index) {
      if (cellValue === '1') {
        return '1-是';
      }else if(cellValue === '0'){
        return '0-否'
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
        current:this.queryParams.current,
        size:this.queryParams.size,
        networkService:this.queryParams.networkService,
        describe:this.queryParams.describe,
      }
      heheList(msg).then(response => {
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
              id:this.row[0].id,
              networkService: this.dialog.form.networkService,
              serUrl: this.dialog.form.serUrl,
              isOpen: this.dialog.form.isOpen,
              describe: this.dialog.form.describe,
              jsonColumn: this.dialog.form.jsonColumn
            }
            updateheheList(updateMsg).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialog.open = false;
              this.getList();
            });
          } else {
            let msg = {
              networkService: this.dialog.form.networkService,
              serUrl: this.dialog.form.serUrl,
              isOpen: this.dialog.form.isOpen,
              describe: this.dialog.form.describe,
              jsonColumn: this.dialog.form.jsonColumn
            }
            addheheList(msg).then(response => {
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
        networkService: "",
        serUrl: "",
        isOpen: "",
        describe: "",
        jsonColumn: ""
      };
      this.resetForm("form");
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      console.log(selection,'多行数据选中');
      this.row = selection
      this.hehIdList = selection.map(item => item.id)
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
      console.log(this.hehIdList,'del');
      let delMsg = {
       "idList": this.hehIdList
      };
      this.$modal.confirm('是否确认删除选中数据？')
      .then(function(){
        return delheheList(delMsg);
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
        networkService: this.row[0].networkService,
        serUrl: this.row[0].serUrl,
        isOpen: this.row[0].isOpen,
        describe: this.row[0].describe,
        jsonColumn: this.row[0].jsonColumn
      }
      this.dialog.open = true
      this.dialog.title = "修改";
    }
  }
};
</script>