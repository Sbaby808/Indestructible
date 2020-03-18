import * as API from './'

export default{
  create_db: params => {
    return API.POST('/database/new_db', params);
  },
  drop_db: params => {
    return API.DELETE('/database/del_db', params);
  }
}
