import request from '@/utils/request'

// 查询参数列表
export function servelist(data) {
  return request({
    url: '/system/serviceReg/selectPage',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addServeList(data) {
  return request({
    url: '/system/serviceReg/saveServiceReg',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delServeList(data) {
  return request({
    url: '/system/serviceReg/delete',
    method: 'post',
    data: data
  })
}
/**
 * 修改接口
 */
export function modifyServeList(data){
  return request({
    url: '/system/serviceReg/update',
    method: 'post',
    data: data
  })
}

