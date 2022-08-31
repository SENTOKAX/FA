import request from './request'

export const SUCCESS = 0

export const noticeList = (next?: string, limit?: number, prev?: string) => {
  return request.get(
    `/notify${limit ? `?limit=${limit}` : '?limit=10'}${next ? `&next=${next}` : ''}${
      prev ? `&prev=${prev}` : ''
    }`
  )
}

export const readNotice = async (ids: string) => {
  const { data } = await request.post('/notify/read', { ids })
  return data
}

export const deleteNotice = async (ids: string) => {
  const { data } = await request.post('/notify/delete', { ids })
  return data
}
