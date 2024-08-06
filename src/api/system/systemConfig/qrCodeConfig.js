import request from '@/utils/request'
// 查询参数列表
export function qrCodeList(data) {
  return request({
    url: '/system/sysQrcode/findList',
    method: 'post',
    data: data
  })
}
// 新增数据
export function addqrCodeList(data) {
  return request({
    url: '/system/sysQrcode/save',
    method: 'post',
    data: data
  })
}
// 删除数据
export function delqrCodeList(data) {
  return request({
    url: '/system/sysQrcode/delete',
    method: 'delete',
    data: data
  })
}
/**
 * 修改接口
 */
export function updateqrCodeList(data){
  return request({
    url: '/system/sysQrcode/update',
    method: 'post',
    data: data
  })
}

