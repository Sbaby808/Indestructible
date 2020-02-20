<template>
	<div>
		<el-container>
      <el-header style="height: 100px;">
        <HeaderContent></HeaderContent>
      </el-header>
      <el-container>
        <el-aside width="400px">Aside</el-aside>
        <el-container>
          <el-main style="padding: 0px;">
            <div id="v-content" v-bind:style="{minHeight: Height+'px'}">
              <el-container>
                <el-header style="background-color: #E9EEF3;height: auto;">
                  <SQLContent></SQLContent>
                </el-header>
                <el-main>
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
	export default {
    components:{HeaderContent,FooterContent,SQLContent,DataContent},
		name:'IndexPage',
		data() {
			return {
        Height:0
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
    background-color: #CCCCCC;
    color: #333;
    text-align: center;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
  }
</style>
