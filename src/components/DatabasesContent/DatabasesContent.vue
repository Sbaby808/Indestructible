<template>
	<div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="newConnection" round>新建连接</el-button>
        </div>
      </el-col>
    </el-row>
    <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
    <el-dialog title="新建数据库连接" :visible.sync="dialogVisible" :before-close="closeDialog" :destroy-on-close="true" :close-on-click-modal="false">
      <el-form :model="connectionForm" :rules="rules">
        <el-form-item label="主机" :label-width="formLabelWidth" prop="url">
          <el-input v-model="connectionForm.url" clearable placeholder="请输入主机地址,如:127.0.0.1" required></el-input>
        </el-form-item>
        <el-form-item label="端口号" :label-width="formLabelWidth" prop="port">
          <el-input v-model="connectionForm.port" clearable placeholder="请输入端口号,如:3306" required></el-input>
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="connectionForm.username" clearable placeholder="请输入用户名,如:root"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="connectionForm.password" clearable placeholder="请输入密码,如:123456" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="testConnection" type="warning" icon="el-icon-help" round>测试连接</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </div>
  </el-dialog>
	</div>
</template>

<script>
	export default {
		name:'DatabasesContent',
		data() {
			return {
        dialogVisible : false,
        connectionForm:{
          url:'',
          port:'',
          username:'',
          password:''
        },
        rules:{
          url:[
            { required: true, message: '请输入主机地址', trigger: 'blur' }
          ],
          port:[
            { required: true, message: '请输入端口号', trigger: 'blur' }
          ],
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        },
        formLabelWidth : '80px',
        data: [{
          label: '一级 1',
          children: [{
            label: '二级 1-1',
            children: [{
              label: '三级 1-1-1'
            }]
          }]
        }, {
          label: '一级 2',
          children: [{
            label: '二级 2-1',
            children: [{
              label: '三级 2-1-1'
            }]
          }, {
            label: '二级 2-2',
            children: [{
              label: '三级 2-2-1'
            }]
          }]
        }, {
          label: '一级 3',
          children: [{
            label: '二级 3-1',
            children: [{
              label: '三级 3-1-1'
            }]
          }, {
            label: '二级 3-2',
            children: [{
              label: '三级 3-2-1'
            }]
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
			};
	},
    methods: {
      handleNodeClick(data) {
        console.log(data);
      },
      // 新建数据库连接
      newConnection() {
        this.dialogVisible = true;
      },
      // 测试数据库连接
      testConnection () {
        // TODO
      },
      // 关闭Dialog前回调
      closeDialog() {
        this.connectionForm = {
          url:'',
          port:'',
          username:'',
          password:''
        };
        this.dialogVisible = false;
      }
    }
  };
</script>

<style>
  .el-row {
    margin-top: 2px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .bg-purple-dark {
    background: #99a9bf;
    /* background: #E9EEF3; */
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .el-col {
    border-radius: 4px;
  }
  .el-button {
    margin-top: 4px;
    margin-left: 8px;
  }
</style>
