import * as API from './'

export default{
  test_conn: params => {
    return API.POST('/init/test_conn', params);
  },
  get_databases_and_tables: params => {
    return API.GET('/init/get_databases_and_tables', params);
  }
}
