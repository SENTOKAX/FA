import { request } from './utils'

describe('通知模块', () => {

  test('获取通知列表-异常-参数异常', async ()=>{
    try {
      await request.get('/notify?next=1')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/notify?prev=1')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/notify?limit=0')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/notify?limit=21')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('获取通知列表-成功', async () => {
    const { data } = await request.get('/notify', {})
    const accounts = []
    data.data.items.map((notify) => {
      accounts.push(notify.user.account)
    })
    expect(data.code).toBe(0)
    expect(data.data.items.length).toBeGreaterThan(0)
    expect(accounts).toContain("jiangtao")
  })

  test('通知设为已读-异常-参数异常', async ()=>{
    try {
      await request.post('/notify/read', {
        ids: '62fda9b791c7'
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.post('/notify/read', {})
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('通知设为已读-成功', async () => {
    const { data } = await request.post('/notify/read', {
      ids: '62fda9b791c78ccc28da5854'
    })
    expect(data.code).toBe(0)
  })

  test('删除通知-异常-参数异常', async ()=>{
    try {
      await request.post('/notify/delete', {
        ids: '62fda9b791c7'
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.post('/notify/delete', {})
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('删除通知-成功', async () => {
    const { data } = await request.post('/notify/delete', {
      ids: '62feed5bdfbce2a614f55685'
    })
    expect(data.code).toBe(0)
  })
})
