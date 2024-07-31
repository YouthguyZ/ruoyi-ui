import request from '@/utils/request'

// 查询参数列表
export function list(data) {
  return request({
    url: '/system/print/selectPage',
    method: 'post',
    data: data
  })
}

// 删除数据
export function deleteList(data) {
  return request({
    url: '/system/print/deleteTradeSetting',
    method: 'post',
    data: data
  })
}

