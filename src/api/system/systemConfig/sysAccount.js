import request from '@/utils/request'
// 查询参数列表
export function accountlist(data) {
  return request({
    url: '/system/acctParam/selectPage ',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addAccountList(data) {
  return request({
    url: '/system/acctParam/save',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delAccountList(data) {
  return request({
    url: '/system/acctParam/delete',
    method: 'delete',
    data: data
  })
}
/**
 * 修改接口
 */
export function updateAccountList(data){
  return request({
    url: '/system/acctParam/update',
    method: 'post',
    data: data
  })
}

