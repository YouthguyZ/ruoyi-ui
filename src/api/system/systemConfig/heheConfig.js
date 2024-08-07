import request from '@/utils/request'
// 合合版面配置
// 查询参数列表
export function heheList(data) {
  return request({
    url: '/system/sysConHH/findList',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addheheList(data) {
  return request({
    url: '/system/sysConHH/add',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delheheList(data) {
  return request({
    url: '/system/sysConHH/delete',
    method: 'delete',
    data: data
  })
}
/**
 * 修改接口
 */
export function updateheheList(data){
  return request({
    url: '/system/sysConHH/update',
    method: 'post',
    data: data
  })
}

