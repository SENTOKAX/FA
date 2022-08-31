import request from './request'

export const SUCCESS = 0

export const register = async (id: string, account: string) => {
  const { data } = await request.post('/user/register', { id, account })
  return data
}

export const logoutAccount = async () => {
  const { data } = await request.post('/user/logout')
  return data
}

export const modifyInfo = async (info: {
  avatar?: string
  banner?: string
  bio?: string
  nickname?: string
}) => {
  const { data } = await request.post('/user/modifyInfo', info)
  return data
}

export const info = () => {
  return request.get('/user/info')
}

export const searchUser = async (
  filter?: {
    keyword?: string
    uid?: string
    follow?: number
  },
  paging?: {
    next?: string
    limit?: number
    prev?: string
  }
) => {
  const query = new URLSearchParams({})
  if (paging?.next) query.append('next', paging.next)
  if (paging?.limit) query.append('limit', String(paging.limit))
  if (paging?.prev) query.append('prev', paging.prev)
  if (filter?.keyword) query.append('keyword', filter.keyword)
  if (filter?.uid) query.append('uid', filter.uid)
  if (filter?.follow) query.append('follow', String(filter.follow))
  const { data } = await request.get(`/user/search?&${query.toString()}`)
  return data
}

export const getUserInfo = async (account?: string) => {
  const { data } = await request.get(`/user/${account || ''}`)
  return data
}
