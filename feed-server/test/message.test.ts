import { request } from './utils'

let errorSendTo = '62ff601259436afbc8fe89'
let sendTo = '62ff601259436afbc8fe89a1'
let notExistId = '62ff601259436afbc8fe89a2'
let selfId = '62ff602059436afbc8fe89a3'
let selfAccount = 'lijiaxin'
let errorUrl = '123'

describe('私信模块', () => {

  test('发送私信=异常-参数异常', async ()=>{
    try {
      await request.post('/message/send', {
        sendTo: errorSendTo
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/message/send', {
        sendTo: sendTo,
        image: errorUrl
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/message/send', {
        sendTo: sendTo
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('发送私信-异常-业务异常-用户不存在', async () => {
    const { data } = await request.post('/message/send', {
      sendTo: notExistId,
      content: 'test send message'
    })
    expect(data.code).toBe(1006)
  })

  test('发送私信-异常-业务异常-向自己发送私信', async () => {
    const { data } = await request.post('/message/send', {
      sendTo: selfId,
      content: 'test send message'
    })
    expect(data.code).toBe(1600)
  })

  test('发送私信-成功-发送文字', async () => {
    const { data } = await request.post('/message/send', {
      sendTo: sendTo,
      content:'1111',
    })
    expect(data.code).toBe(0)
    expect(data.data.type).toBe(1)
  })

  test('发送私信-成功-发送图片', async () => {
    const { data } = await request.post('/message/send', {
      sendTo: '62feeaabdfbce2a614f55660',
      image: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKZIiah7kNMOjPnHicZEiaOuoqgGVGUk03kGeAr8oXJwBPyNNrp7teMia62H0V4kpDFicSbHGjhnTvYGiaw/132'
    })
    expect(data.code).toBe(0)
    expect(data.data.type).toBe(2)
  })

  test('删除私信=异常-参数异常', async ()=>{
    try {
      await request.post('/message/delete', {
        ids: '62ff6012'
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('删除私信内容-成功', async () => {
    const { data } = await request.post('/message/delete', {
      ids: '62ff2df524209c940d46c64e',
    })
    expect(data.code).toBe(0)
  })

  test('获取会话消息-异常-参数异常', async ()=>{
    try {
      await request.get('/message/dialogue/' + sendTo + '?next=123')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.get('/message/dialogue/' + sendTo + '?prev=123')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.get('/message/dialogue/' + sendTo + '?limit=1')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.get('/message/dialogue/' + sendTo + '?limit=21')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('获取会话消息-异常-业务异常-用户不存在', async ()=>{
    const { data } = await request.get('/message/dialogue/' + notExistId)
    expect(data.code).toBe(1006)
  })

  test('获取会话消息-异常-业务异常-获取和自己的消息记录', async ()=>{
    const { data } = await request.get('/message/dialogue/' + selfAccount)
    expect(data.code).toBe(1601)
  })

  test('获取会话消息-成功', async ()=>{
    const { data } = await request.get('/message/dialogue/jiangtao')
    expect(data.code).toBe(0)
  })

  test('删除私信会话=异常-参数异常', async ()=>{
    try {
      await request.post('/message/delete/session', {
        ids: '62ff6012'
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('删除私信会话-成功', async () => {
    const { data } = await request.post('/message/delete/session', {
      ids: '62feeb305b111ffa6cbe202a',
    })
    expect(data.code).toBe(0)
  })

  test('获取私信列表-异常-参数异常', async() =>{
    try {
      await request.get('/message/list?limit=0')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/message/list?limit=21')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('获取私信列表-成功', async () => {
    const { data } = await request.get('/message/list', {})
    expect(data.code).toBe(0)
    expect(data.data.list.length).toBeGreaterThan(0)
    const accounts = []
    data.data.list.map((message) => {
      accounts.push(message.user.account)
    })
    expect(accounts).toContain("jiangtao")
  })

})
