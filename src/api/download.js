import * as API from './'

export default{
  download: params => {
    return API.GET('/download', params);
  },
}
