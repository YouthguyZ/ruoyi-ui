import request from '@/utils/request'
// 系统来源定义表页面接口
// 查询参数列表
export function dataSourcelist(data) {
  return request({
    url: '/system/serviceDatasource/selectPage',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addSourceList(data) {
  return request({
    url: '/system/serviceDatasource/save',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delSourceList(data) {
  return request({
    url: '/system/serviceDatasource/delete',
    method: 'delete',
    data: data
  })
}
/**
 * 修改接口
 */
export function updateSourceList(data){
  return request({
    url: '/system/serviceDatasource/update',
    method: 'post',
    data: data
  })
}
// 服务id查询
export function serviceIdQuery(parms){
  return request({
    url: '/system/serviceReg/selectAll',
    method: 'get',
    parms: parms
  })
}

