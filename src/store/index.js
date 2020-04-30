import Vue from 'vue'
import Vuex from 'vuex'

// 挂载Vuex
Vue.use(Vuex)

// 创建VueX对象
const store = new Vuex.Store({
  state:{
    // 存放的键值对就是所要管理的状态
    // 展示的表数据
    tableData: [],
    // 展示的表数据的列
    columns: [],
    // 总条数
    total: 0,
    // 当前页
    currentPage: 1,
    // 当前查询的数据库
    dbName: '',
    // 当前查询的表名
    tbName: '',
    // 是否重新查询
    searchFlag: false,
    // 是否显示分页插件
    showPage: true,
  },
  mutations:{
    setTableData(state, payload) {
      state.tableData = payload;
    },
    setColumns(state, payload) {
      state.columns = payload;
    },
    setTotal(state, payload) {
      state.total = payload;
    },
    setCurrentPage(state, payload) {
      state.currentPage = payload;
    },
    setDbName(state, payload) {
      state.dbName = payload;
    },
    setTbName(state, payload) {
      state.tbName = payload;
    },
    setSearchFlag(state, payload) {
      state.searchFlag = payload;
    },
     setShowPage(state, payload) {
       state.showPage = payload;
     }
  }
})

export default store
