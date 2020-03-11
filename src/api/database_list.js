import * as API from './'

export default{
  test_conn: params => {
    return API.POST('/test_conn', params);
  }
}
