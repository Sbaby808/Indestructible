<template>
	<div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="newConnection" round>新建连接</el-button>
        </div>
      </el-col>
    </el-row>
    <div id="dataPage">
      <el-tree :data="data" id="el-tree" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
      <context-menu class="right-menu"
          :target="contextMenuTarget"
          :show="contextMenuVisible"
          @update:show="(show) => contextMenuVisible = show">
        <a href="javascript:;" @click="createDatabaseOrTable">新建{{this.menuLabel}}</a>
        <a href="javascript:;" @click="deleteDatabaseOrable">删除{{this.menuLabel}}</a>
        <a href="javascript:;" @click="attribute">属性</a>
      </context-menu>
    </div>
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
        contextMenuTarget: null,
        contextMenuVisible: false,
        nodeData: {},
        data: [{
          label: '一级 1',
          children: [{
            label: '二级 1-1',
            label: '二级 1-2',
          }]
        }, {
          label: '一级 2',
          children: [{
            label: '二级 2-1',
          }, {
            label: '二级 2-2',
          }]
        }, {
          label: '一级 3',
          children: [{
            label: '二级 3-1',
          }, {
            label: '二级 3-2',
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
			};
	},
    methods: {
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
      },
      handleNodeClick(data) {
        // console.log(data)
        this.nodeData = data
      },
      createDatabaseOrTable() {
        this.contextMenuVisible = false;
        console.log("create " + this.menuLabel);
      },
      deleteDatabaseOrable() {
        this.contextMenuVisible = false;
        console.log("delete " + this.menuLabel);
      },
      attribute() {
        this.contextMenuVisible = false;
        console.log("show attribute " + this.menuLabel);
      }
    },
    mounted() {
      this.$nextTick(() => {
        // vue-context-menu 需要传入一个触发右键事件的元素，等页面 dom 渲染完毕后才可获取
        this.contextMenuTarget = document.querySelector('#el-tree')
        // 获取所有的 treeitem，循环监听右键事件
        const tree = document.querySelectorAll('#el-tree [role="treeitem"]')
        tree.forEach(i => {
          i.addEventListener('contextmenu',event => {
            // 如果右键了，则模拟点击这个treeitem
            event.target.click()
          })
        })
      })
    },
    computed: {
      menuLabel() {
        return this.nodeData.children == null ? '表' : '数据库';
      }
    },
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
  html,
  body {
    height: 100%;
  }
  #dataPage {
    margin: 0 0;
    font-family: 'Microsoft Yahei', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
  // 右键会选中文字，为了美观将它禁用
  #el-tree{
    user-select:none;
  }
  .right-menu {
    position: fixed;
    background: #fff;
    border: solid 1px rgba(0, 0, 0, .2);
    border-radius: 3px;
    z-index: 999;
    display: none;
  }
  .right-menu a {
    width: 150px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    display: block;
    color: #1a1a1a;
  }
  .right-menu a:hover {
    background: #eee;
    color: #fff;
  }
  .right-menu {
      border: 1px solid #eee;
      box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
      border-radius: 1px;
  }
  a {
      text-decoration: none;
  }
  .right-menu a {
      padding: 2px;
  }
  .right-menu a:hover {
      background: #42b983;
  }
</style>
