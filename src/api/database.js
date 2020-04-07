import * as API from './'

export default{
  create_db: params => {
    return API.POST('/database/new_db', params);
  },
  drop_db: params => {
    return API.DELETE('/database/del_db', params);
  },
  drop_tb: params => {
    return API.DELETE('/database/del_tb', params);
  },
  export_db: params => {
    return API.GET('/database/export_db', params);
  },
  table_structure: params => {
    return API.GET("/database/table_structure", params);
  },
  drop_column: params => {
    return API.DELETE("/database/drop_column", params);
  },
  add_column: params => {
    return API.POST("/database/add_column", params);
  }
}
