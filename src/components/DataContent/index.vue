<template>
	<div>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column v-for="column in columns" :key="column"
        :prop="column"
        :label="column"
        width="180">
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align: left;"
      background
      layout="total, prev, pager, next"
      :current-page.sync="currentPage"
      :hide-on-single-page="true"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
  import global_varibles from '../global_varibles'
	export default {
		name:'DataContent',
		data() {
      return {
        // tableData:[],
        // columns: []
      }
    },
    methods: {
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      // 翻页
      // handleCurrentChange(val) {
      //   // console.log(`当前页: ${val}`);
      //   this.$store.commit("setCurrentPage", val);
      //   this.$store.commit("setSearchFlag", true);
      // }
    },
    computed:{
      tableData(){
        return this.$store.state.tableData;
      },
      columns(){
        return this.$store.state.columns;
      },
      total() {
        return this.$store.state.total;
      },
      currentPage: {
        get() {
          return this.$store.state.currentPage;
        },
        set(val) {
          if(global_varibles.dataSource != '') {
            this.$store.commit("setCurrentPage", val);
            this.$store.commit("setSearchFlag", true);
          }
        }

      }
    }
	}
</script>

<style>

</style>
