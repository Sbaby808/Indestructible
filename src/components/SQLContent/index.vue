<template>
  <div class="edit-code-editor" style="text-align: left;">
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-document-add" @click="openSQL" plain>打开</el-button>
          <el-button type="info" size="mini" icon="el-icon-video-play" @click="runSQL" plain>运行</el-button>
          <el-button type="success" size="mini" icon="el-icon-download" @click="saveSQL" plain>保存</el-button>
          <el-button type="warning" size="mini" icon="el-icon-delete" @click="clearSQL" plain>清空</el-button>
        </div>
      </el-col>
    </el-row>
    <textarea ref="mycode" class="codesql" v-model="code" style="height:150px;width:auto;"></textarea>
  </div>
</template>

<script>
  import global_varibles from '../global_varibles';
  import database from '../../api/database.js'
  import "codemirror/theme/mdn-like.css";
  import "codemirror/lib/codemirror.css";
  import "codemirror/addon/hint/show-hint.css";

  let CodeMirror = require("codemirror/lib/codemirror");
  require("codemirror/addon/edit/matchbrackets");
  require("codemirror/addon/selection/active-line");
  require("codemirror/mode/sql/sql");
  require("codemirror/addon/hint/show-hint");
  require("codemirror/addon/hint/sql-hint");
	export default {
		name:'SQLContent',
		data() {
			return {
        code: '/* 按Ctrl键进行代码提示 */',
        sqlFile:null,
        fileName:'SQLscripts',
			};
		},
    methods: {
      openSQL() {
        var _this = this;
        // 打开SQL脚本文件
        this.sqlFile=document.createElement('input')
        this.sqlFile.setAttribute('id','_ef');
        this.sqlFile.setAttribute('type','file');
        this.sqlFile.setAttribute("style",'visibility:hidden');
        document.body.appendChild(this.sqlFile);
        this.sqlFile.click();
        this.sqlFile.value ;
        this.sqlFile.addEventListener('change', function(e){
          var reader = new FileReader();
          reader.onload = function(e){
            // console.log(e.target.result);
            // 检查是否是 SQL 文件
            if(_this.sqlFile.files[0].name.endsWith('.sql')) {
              _this.code = e.target.result;
              try {
                global_varibles.editor.setValue(window.JSON.parse(_this.code));
              }catch(e){
                console.log(e);
                global_varibles.editor.setValue(_this.code);
              }

            } else {
              _this.$message({
                dangerouslyUseHTMLString: true,
                message: '<span>您打开的不是 <strong>SQL</strong> 文件</span>',
                type: 'warning'
              });
            }

          };
          reader.readAsText(e.target.files[0]);
        });
      },
      runSQL() {
        if(global_varibles.dataSource == '') {
          this.$message({
            message: '请连接数据源后再进行操作！',
            type: 'error'
          });
        } else {
          if(this.code == '') {
            this.$message({
              message: '请输入 SQL 脚本！',
              type: 'warning'
            });
          } else {
            database.execute_sql({
              dataSource : global_varibles.dataSource,
              sqlScript : global_varibles.sqlCode
            }).then(result => {
              console.log(result);
              if(result.meta.success) {
                if(result.data.data) {
                  this.$store.commit('setTableData', result.data.data);
                  this.$store.commit('setColumns', result.data.columns);
                  this.$store.commit('setTotal', result.data.total);
                  this.$store.commit('setShowPage', false);
                }
                this.$message({
                  message: '执行SQL脚本成功！',
                  type: 'success'
                });
              } else {
                this.$message({
                  message: result.meta.message,
                  type: 'error'
                });
              }
            }).catch(result => {
              alert(result);
            })
          }
        }
      },
      saveSQL() {
        this.$prompt('请输入文件名', '保存SQL脚本到本地', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^(.)+$/,
          inputErrorMessage: '文件名不能为空'
        }).then(({ value }) => {
          this.$message({
            type: 'success',
            message: '保存为: ' + value + '.sql'
          });
          this.fileName = value;
          this.download_SQL();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });
      },
      clearSQL() {
        // 清空SQL脚本
        global_varibles.editor.setValue('/* 按Ctrl键进行代码提示 */')
        global_varibles.sqlCode = ''
        this.code = ''
      },
      download_SQL() {
        //定义文件内容，类型必须为Blob 否则createObjectURL会报错
        let content = new Blob([window.JSON.stringify(global_varibles.sqlCode)])

        //生成url对象
        let urlObject = window.URL || window.webkitURL || window
        let url = urlObject.createObjectURL(content)
        //生成<a></a>DOM元素
        let el = document.createElement('a')
        //链接赋值
        el.href = url
        el.download = this.fileName + '.sql'
        //必须点击否则不会下载
        el.click()
        //移除链接释放资源
        urlObject.revokeObjectURL(url)
        this.fileName = 'SQLscripts'
        this.clearSQL()
      }
    },
    mounted () {
        debugger
        let mime = 'text/x-mariadb'
        let theme = 'mdn-like'//设置主题，不设置的会使用默认主题
        let editor = CodeMirror.fromTextArea(this.$refs.mycode, {
          mode: mime,//选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
          indentWithTabs: true,
          smartIndent: true,
          lineNumbers: true,
          matchBrackets: true,
          theme: theme,
          autofocus: true,
          extraKeys: {'Ctrl': 'autocomplete'},//自定义快捷键
          hintOptions: {//自定义提示选项
            tables: {
              users: ['name', 'score', 'birthDate'],
              countries: ['name', 'population', 'size']
            }
          }
        })
        //代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
        // editor.on('cursorActivity', function () {
        //   editor.showHint()
        // })
        editor.setSize(-1, 150);
        editor.on('change', function(){
          global_varibles.sqlCode = editor.getValue()
          // console.log(global_varibles.sqlCode)
        });
        global_varibles.editor = editor;
      }
	}
</script>

<style>
  body{
    font-size: 18px;
  }

  .codesql {
    font-size: 18px;
    font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
  }
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
