<template>
	<div>
		<el-container>
      <el-header style="height: 100px;">
        <HeaderContent></HeaderContent>
      </el-header>
      <el-container>
        <el-aside width="auto" v-bind:style="{maxHeight: Height+60+'px'}">
          <DatabasesContent></DatabasesContent>
        </el-aside>
        <el-container>
          <el-main style="padding: 0px;">
            <div id="v-content" v-bind:style="{minHeight: Height+'px'}">
              <el-container>
                <el-header style="background-color: #E9EEF3;height: auto;padding: 0;">
                  <SQLContent></SQLContent>
                </el-header>
                <el-main style="background-color: #578DBF;padding-left:5px;padding-top: 5px;padding-right: 0px;padding-bottom: 0px;margin: 0px;">
                  <DataContent></DataContent>
                </el-main>
              </el-container>
            </div>
          </el-main>
          <el-footer>
            <FooterContent></FooterContent>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
	</div>
</template>

<script>
  import HeaderContent from '../HeaderContent/index'
  import FooterContent from '../FooterContent/index'
  import SQLContent from '../SQLContent/index'
  import DataContent from '../DataContent/index'
  import DatabasesContent from '../DatabasesContent/DatabasesContent'
	export default {
    components:{
      HeaderContent,
      FooterContent,
      SQLContent,
      DataContent,
      DatabasesContent,},
		name:'IndexPage',
		data() {
			return {
        Height:0,
			};
		},
    mounted(){
      //动态设置内容高度 让footer始终居底   header+footer的高度是100
      this.Height = document.documentElement.clientHeight - 160;
  　　//监听浏览器窗口变化　
      window.onresize = ()=> {this.Height = document.documentElement.clientHeight -160}
    }
	}
</script>

<style>
  body{
    margin: 0px;
    padding: 0px;
  }

  .el-header, .el-footer {
    background-color: #000000;
    color: #333;
    text-align: center;
  }

  .el-aside {
    background-color: #FFFFFF;
    color: #333;
    text-align: center;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
  }
</style>
