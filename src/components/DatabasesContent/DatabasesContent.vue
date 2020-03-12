<template>
	<div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="newConnection" round>新建连接</el-button>
          <el-button type="warning" size="mini" icon="el-icon-refresh" @click="refreshList" round>刷新列表</el-button>
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
        <a href="javascript:;" @click="deleteDatabaseOrTable">删除{{this.menuLabel}}</a>
        <a href="javascript:;" @click="attribute">属性</a>
        <a href="javascript:;" @click="exdbPortDatabaseOrTable">导出{{this.menuLabel}}</a>
      </context-menu>
    </div>
    <el-dialog title="新建数据库连接" :visible.sync="dialogVisible" :before-close="closeDialog" :destroy-on-close="true" :close-on-click-modal="false">
      <el-form :model="dbInfo" :rules="rules">
        <el-form-item label="主机" :label-width="formLabelWidth" prop="dbIp">
          <el-input v-model="dbInfo.dbIp" clearable placeholder="请输入主机地址,如:127.0.0.1" required></el-input>
        </el-form-item>
        <el-form-item label="端口号" :label-width="formLabelWidth" prop="dbPort">
          <el-input v-model="dbInfo.dbPort" clearable placeholder="请输入端口号,如:3306" required></el-input>
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="dbUser">
          <el-input v-model="dbInfo.dbUser" clearable placeholder="请输入用户名,如:root"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="dbPasswd">
          <el-input v-model="dbInfo.dbPasswd" clearable placeholder="请输入密码,如:123456" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="testConnection" type="warning" icon="el-icon-help" round>测试连接</el-button>
        <el-button type="primary" @click="confirmConnection">确 定</el-button>
      </div>
  </el-dialog>
	</div>
</template>

<script>
  import database_list from '../../api/database_list.js'
  import global_varibles from '../global_varibles'
	export default {
		name:'DatabasesContent',
		data() {
			return {
        dialogVisible : false,
        dbInfo:{
          dbIp:'',
          dbPort:'',
          dbUser:'',
          dbPasswd:''
        },
        rules:{
          dbIp:[
            { required: true, message: '请输入主机地址', trigger: 'blur' }
          ],
          dbPort:[
            { required: true, message: '请输入端口号', trigger: 'blur' }
          ],
          dbUser:[
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          dbPasswd:[
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        },
        formLabelWidth : '80px',
        contextMenuTarget: null,
        contextMenuVisible: false,
        nodeData: {},
        data: [],
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
      // 刷新数据库列表
      refreshList() {

      },
      // 测试数据库连接
      testConnection () {
        database_list.test_conn(this.dbInfo)
        .then(result => {
          if(result.meta.success) {
            global_varibles.testDataSource = result.meta.dataSource;
            global_varibles.dataSource = result.meta.dataSource;
            this.$message({
              message: '连接成功！',
              type: 'success'
            })
          } else {
            this.$message({
              message: result.meta.message,
              type: 'error'
            });
          }
        }).catch(result => {
          alert(result)
        })
      },
      // 确定连接
      confirmConnection() {
        database_list.test_conn(this.dbInfo)
        .then(result => {
          if(result.meta.success) {
            global_varibles.dataSource = result.meta.dataSource;
            database_list.get_databases_and_tables({
              dataSource:global_varibles.dataSource
            })
            .then(result => {
              if(result.meta.success) {
                global_varibles.dataSource = result.meta.dataSource;
                this.data = result.data.result;
                this.dialogVisible = false;
                this.$message({
                  message: '连接成功！',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: result.meta.message,
                  type: 'error'
                });
              }
            }).catch(result => {
              alert(result)
            })
          } else {
            this.$message({
              message: result.meta.message,
              type: 'error'
            });
          }
        }).catch(result => {
          alert(result)
        })
      },
      // 关闭Dialog前回调
      closeDialog() {
        this.dbInfo = {
          dbIp:'',
          dbPort:'',
          dbUser:'',
          dbPasswd:''
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
      deleteDatabaseOrTable() {
        this.contextMenuVisible = false;
        console.log("delete " + this.menuLabel);
      },
      attribute() {
        this.contextMenuVisible = false;
        console.log("show attribute " + this.menuLabel);
      },
      exdbPortDatabaseOrTable() {
        this.contextMenuVisible = false;
        console.log("exdbPort " + this.menuLabel);
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
    font-size: 14px;
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
      background: #99A9BF;
  }
</style>
