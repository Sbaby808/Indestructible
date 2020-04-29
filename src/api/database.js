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
  },
  modify_column: params => {
    return API.POST("/database/modify_column", params);
  },
  show_table_data: params => {
    return API.GET("/database/show_table_data", params);
  },
  get_database_charset_and_collation: params => {
    return API.GET("/database/get_database_charset_and_collation", params);
  },
  update_database_charset_and_collation: params => {
    return API.POST("/database/update_database_charset_and_collation", params);
  },
  export_table: params => {
    return API.GET('/database/export_table', params);
  }
}
