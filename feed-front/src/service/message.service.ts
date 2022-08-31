import request from './request'
export const SUCCESS = 0
export const sendOneMessage = async (body: {
  sendTo: string
  content?: string
  image?: string
}) => {
  const { data } = await request.post('/message/send', body)
  return data
}

export const deleteMessageItem = async (body: { ids: string | string[] }) => {
  const { data } = await request.post('/message/delete', body)
  return data
}

export const getMessageList = async (params?: { limit?: number; next?: number; prev?: number }) => {
  const query = new URLSearchParams({
    limit: (params?.limit || 10).toString(),
  })
  if (params?.next) query.append('next', String(params.next))
  if (params?.prev) query.append('prev', String(params.prev))
  const { data } = await request.get(`/message/list?${query.toString()}`)
  return data
}

export const getDialogueList = async (
  account: string,
  params?: {
    limit?: number
    next?: string
    prev?: string
  }
) => {
  const query = new URLSearchParams({
    limit: (params?.limit || 10).toString(),
  })
  if (params?.next) query.append('next', params.next)
  if (params?.prev) query.append('prev', params.prev)
  const { data } = await request.get(`/message/dialogue/${account}?${query.toString()}`)
  return data
}

export const deleteMessageSessionItem = async (id: string) => {
  const { data } = await request.post('/message/delete/session', { ids: id })
  return data
}

export const changeMessageTopStatus = async (id: string, top: boolean) => {
  const { data } = await request.post(`/message/top/${id}?top=${top}`)
  return data
}
