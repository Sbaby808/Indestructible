<template>
  <div class="edit-code-editor" style="text-align: left;">
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-document-add" @click="openSQL">打开</el-button>
          <el-button type="info" size="mini" icon="el-icon-video-play" @click="runSQL">运行</el-button>
          <el-button type="success" size="mini" icon="el-icon-download" @click="saveSQL">保存</el-button>
        </div>
      </el-col>
    </el-row>
    <textarea ref="mycode" class="codesql" v-model="code" style="height:150px;width:auto;"></textarea>
  </div>
</template>

<script>
  import global_varibles from '../global_varibles';
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
            _this.code = e.target.result;
            global_varibles.editor.setValue(window.JSON.parse(_this.code));
          };
          reader.readAsText(e.target.files[0]);
        });
      },
      runSQL() {
        // TODO
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
      download_SQL() {
        this.dialogVisible = false
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
