import * as API from './'

export default{
  create_db: params => {
    return API.POST('/database/new_db', params);
  },
}
