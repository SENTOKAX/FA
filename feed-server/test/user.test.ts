import { request } from './utils'
import { UserStatus } from '../src/models/types'

let shortAccount = '123'
let longAccount = '12345678900987654321'
let existAccount = 'jiangtao'
let normalAccount = 'lijiaxin'
let notExistAccount = 'hhhh'
let modifiedNickname = 'lijiaxin123'
let notUrl = 'not url'
// 130
let bioLength = '中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文中文'
let nicknameLengthMin = '太短'
let nicknameLengthMax = '18以上18以上18以上18以上'

describe('用户模块', () => {

  test('微信登录-异常-参数校验', async ()=>{
    try {
      await request.get('/user/wxlogin')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('用户注册-异常-参数校验', async ()=>{
    try {
      await request.post('/user/register', {})
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/register', {
        account: shortAccount
      })
    }catch (e){
      expect(e.response.data.code).toEqual(1008)
    }
    try {
      await request.post('/user/register', {
        account: longAccount
      })
    }catch (e){
      expect(e.response.data.code).toEqual(1009)
    }
  })

  test('用户注册-异常-业务异常-用户被禁用', async ()=>{
      const { data } = await request.post('/user/register', {
        account: normalAccount
      })
      expect(data.code).toEqual(1008)
  })

  test('用户注册-异常-业务异常-用户已注册', async ()=>{
      const { data } = await request.post('/user/register', {
        account: normalAccount
      })
      expect(data.code).toEqual(1005)
  })

  test('用户注册-异常-业务异常-用户名存在', async ()=>{
    const { data } = await request.post('/user/register', {
      account: existAccount
    })
    expect(data.code).toEqual(1007)
  })

  test('用户注册-成功', async ()=>{
    const { data } = await request.post('/user/register', {
      account: normalAccount
    })
    expect(data.code).toEqual(0)
  })

  test('获取用户信息-异常-业务异常-用户不存在', async () => {
    const { data } = await request.get('/user/info')
    expect(data.code).toEqual(1006)
  })

  test('获取用户信息-成功', async () => {
    const { data } = await request.get('/user/info')
    expect(data.code).toBe(0)
    expect(data.data.account).toEqual(normalAccount)
    expect(data.data.status).toEqual(UserStatus.Normal)
    expect(data.data.focuses).toEqual(0)
    expect(data.data.followers).toEqual(0)
  })

  test('修改用户信息-异常-参数校验', async () => {
    try {
      await request.post('/user/modifyInfo', {
        avatar: notUrl
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/modifyInfo', {
        banner: notUrl
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/modifyInfo', {
        bio: bioLength
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/modifyInfo', {
        nickname: nicknameLengthMin
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/modifyInfo', {
        nickname: nicknameLengthMax
      })
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.post('/user/modifyInfo', {})
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('修改用户信息-成功', async ()=>{
    const { data } = await request.post('/user/modifyInfo', {
        nickname: modifiedNickname
    })
    expect(data.code).toBe(0)
    expect(data.data.nickname).toBe(modifiedNickname)
  })

  test('搜索用户信息-异常-参数校验', async () => {
    try {
      await request.get('/user/search?uid=')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?uid=122')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?follow=0')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?follow=3')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?next=')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?next=jsjsjsj')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?prev=')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?prev=jsjsjsj')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?limit=0')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }

    try {
      await request.get('/user/search?limit=21')
    } catch (e) {
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('搜索用户信息-成功-关键字搜索', async ()=>{
    const { data } = await request.get('/user/search?keyword=keyword')
    expect(data.code).toBe(0)
  })

  test('搜索用户信息-成功-关注用户', async ()=>{
    const { data } = await request.get('/user/search?follow=1')
    expect(data.code).toBe(0)
  })

  test('搜索用户信息-成功-被关注用户', async ()=>{
    const { data } = await request.get('/user/search?follow=2')
    expect(data.code).toBe(0)
  })

  test('获取账号信息-异常-业务异常-用户不存在', async ()=>{
      const { data } = await request.get('/user/' + notExistAccount)
      expect(data.code).toEqual(1006)
  })

  test('获取账号信息-成功', async () => {
    const { data } = await request.get('/user/' + normalAccount)
    expect(data.code).toBe(0)
    expect(data.data.account).toBe(normalAccount)
  })

  test('退出登录', async () => {
    const { data } = await request.post('/user/logout')
    expect(data.code).toBe(0)
  })
})
