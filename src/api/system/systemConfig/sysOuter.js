import request from '@/utils/request'
// 查询参数列表  外系统配置
export function outerList(data) {
  return request({
    url: '/system/sysParam/findList',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addOuterList(data) {
  return request({
    url: '/system/sysParam/save',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delOuterList(data) {
  return request({
    url: '/system/sysParam/delete',
    method: 'delete',
    data: data
  })
}
/**
 * 修改接口
 */
export function updateOuterList(data){
  return request({
    url: '/system/sysParam/update',
    method: 'post',
    data: data
  })
}

