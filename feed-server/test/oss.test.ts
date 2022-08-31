import { request } from './utils'

describe('oss', () => {
  test('oss-异常-参数异常', async ()=>{
    try {
      await request.get('/oss/upload')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('oss-成功', async ()=>{
    const { data } = await request.get('/oss/upload?filename=test.png')
    expect(data.code).toEqual(0)
    expect(data.OSSAccessKeyId).not.toEqual('')
    expect(data.callback).not.toEqual('')
    expect(data.expire).not.toEqual('')
    expect(data.host).not.toEqual('')
    expect(data.key).not.toEqual('')
    expect(data.policy).not.toEqual('')
    expect(data.processUrl).not.toEqual('')
    expect(data.signature).not.toEqual('')
    expect(data.success_action_status).not.toEqual('')
    expect(data.url).not.toEqual('')
  })

})
