import request from './request'

export const SUCCESS = 0

export const create = (content: string, images: string[]) => {
  return request.post('/post/create', { content, images })
}

export const delPost = (id: string) => {
  return request.post(`/post/delete/${id}`)
}

export const reply = (content: string, images: string[], relationId: string) => {
  return request.post('/post/create/reply', { content, images, relationId })
}

export const transmit = (content: string, images: string[], relationId: string) => {
  return request.post('/post/create/transmit', { content, images, relationId })
}

export const changeLikeStatus = async (id: string, like: boolean) => {
  const { data } = await request.post(`/post/like/${id}?like=${like}`)
  return data
}

export const searchPost = async (
  filter?: {
    keyword?: string
    account?: string
    image?: boolean
    like?: boolean
    likeFor?: string
  },
  paging?: {
    next?: string
    limit?: number
    prev?: string
  }
) => {
  const query = new URLSearchParams({})
  if (paging?.next) query.append('next', paging.next)
  if (paging?.limit) query.append('limit', paging.limit.toString())
  if (paging?.prev) query.append('prev', paging.prev)
  if (filter?.keyword) query.append('keyword', filter.keyword)
  if (filter?.account) query.append('account', filter.account)
  if (filter?.image) query.append('image', String(filter.image))
  if (filter?.like) query.append('like', String(filter.like))
  if (filter?.likeFor) query.append('likeFor', filter.likeFor)
  const { data } = await request.get(`/post/search?&${query.toString()}`)
  return data
}

export const getPostList = (next?: string, limit?: number, prev?: string) => {
  return request.get(
    `/post/relative${limit ? `?limit=${limit}` : '?limit=10'}${next ? `&next=${next}` : ''}${
      prev ? `&prev=${prev}` : ''
    }`
  )
}

export const getPostInfoById = async (id: string) => {
  const { data } = await request.get(`/post/detail/${id}`)
  return data
}

export const getPostReply = async (
  id: string,
  params?: {
    next?: string
    limit?: number
  }
) => {
  const query = new URLSearchParams({
    limit: (params?.limit || 10).toString(),
  })
  if (params?.next) query.append('next', params?.next)
  const { data } = await request.get(`/post/reply/${id}?${query.toString()}`)
  return data
}

export const getPostStatus = async (id: string) => {
  const { data } = await request.get(`/post/status/latest?lastRequestId=${id}`)
  return data
}

export const getNewPost = async (id: string, limit?: number) => {
  const { data } = await request.get(
    `/post/latest?lastRequestId=${id}${limit ? `&limit=${limit}` : '&limit=10'}`
  )
  return data
}
