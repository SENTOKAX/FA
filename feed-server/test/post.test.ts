import { request } from './utils'

describe('帖子模块', () => {
  let testId = ''
  let transId = ''
  test('1.创建帖子', async () => {
    const { data } = await request.post('/post/create', {
      content: '帖子',
      images: [
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
      ],
    })
    expect(data.code).toBe(0)
    expect(data.data.content).toEqual('帖子')
    expect(data.data.images.length).toBe(1)
    testId = data.data._id
  })

  test('2.删除帖子', async () => {
    const { data: del } = await request.post('/post/create', {
      content: 'del',
    })
    const { data: right } = await request.post(`/post/delete/${del.data._id}`)
    const { data: fail } = await request.post(
      '/post/delete/0000000099998ccc00000000'
    )
    expect(right.code).toBe(0)
    expect(fail.code).toBe(1300)
  })

  test('3.回复帖子', async () => {
    const { data } = await request.post('/post/create/reply', {
      relationId: testId,
      content: '回复帖子',
      images: [
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
      ],
    })
    expect(data.code).toBe(0)
    expect(data.data.user).toBeTruthy()
  })

  test('4.转发帖子', async () => {
    const { data } = await request.post('/post/create/transmit', {
      relationId: testId,
      content: '转发帖子',
      images: [
        'https://y.gtimg.cn/music/photo_new/T002R300x300M0000042cH172YJ0mz_2.jpg',
      ],
    })
    expect(data.code).toBe(0)
    transId = data.data._id
  })

  test('5.喜欢/取消喜欢帖子', async () => {
    const { data: like } = await request.post(
      `/post/like/${testId}?like=${true}`
    )
    const { data: unlike } = await request.post(
      `/post/like/${testId}?like=${false}`
    )
    await request.post(`/post/like/${testId}?like=${true}`)
    const { data } = await request.get(`/post/detail/${testId}`)
    expect(like.code).toBe(0)
    expect(unlike.code).toBe(0)
    expect(data.data.post.like).toBeTruthy()
  })

  test('6.查找帖子', async () => {
    const { data: info } = await request.get('/user/info')
    const { data: search } = await request.get(
      `/post/search?&account=${info.data.account}`
    )
    const { data: searchimg } = await request.get(
      `/post/search?&account=${info.data.account}&image=${true}`
    )
    const { data: searchlike } = await request.get(
      `/post/search?&likeFor=${info.data.account}&like=${true}`
    )
    expect(search.code).toBe(0)
    expect(searchimg.code).toBe(0)
    expect(searchlike.code).toBe(0)
    expect(search.data.list.length).toBeLessThanOrEqual(10)
    expect(searchimg.data.list.length).toBeLessThanOrEqual(10)
    expect(searchlike.data.list.length).toBeLessThanOrEqual(10)
  })

  test('7.获取最新帖子', async () => {
    const { data } = await request.get('/post/relative')
    expect(data.code).toBe(0)
    expect(data.data.list.length).toBeLessThanOrEqual(10)
  })

  test('8.获取帖子信息', async () => {
    const { data: right } = await request.get(`/post/detail/${testId}`)
    const { data: fail } = await request.get(
      '/post/detail/0000000099998ccc00000000'
    )
    expect(right.code).toBe(0)
    expect(right.data.post.user).toBeTruthy()
    expect(fail.code).toBe(1300)
  })

  test('9.获取帖子回复信息', async () => {
    const { data: right } = await request.get(`/post/reply/${testId}`)
    const { data: fail } = await request.get(
      '/post/detail/0000000099998ccc00000000'
    )
    expect(right.code).toBe(0)
    expect(right.data.list.length).toBeGreaterThan(0)
    expect(fail.code).toBe(1300)
  })

  test('10.获取帖子状态', async () => {
    const { data: right } = await request.get(
      `/post/status/latest?lastRequestId=${testId}`
    )
    const { data: fail } = await request.get(
      '/post/detail/0000000099998ccc00000000'
    )
    expect(right.code).toBe(0)
    expect(fail.code).toBe(1300)
  })

  test('11.获取新帖子', async () => {
    const { data: right } = await request.get(
      `/post/latest?lastRequestId=${testId}`
    )
    const { data: fail } = await request.get(
      '/post/detail/0000000099998ccc00000000'
    )
    expect(right.code).toBe(0)
    expect(fail.code).toBe(1300)
    await request.post(`/post/delete/${testId}`)
    await request.post(`/post/delete/${transId}`)
  })
})
