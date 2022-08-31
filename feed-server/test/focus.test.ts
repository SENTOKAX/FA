import { request } from './utils'
import { FocusStatus } from '../src/models/types'

let errorId = '254334'
let trueId = '62ff61ae59436afbc8fe89cd'
let followWrong = '123'
let selfId= '62ff602059436afbc8fe89a3'
let notExistId = '62ff602059436afbc8fe89a2'

describe('关注模块', () => {
  test('修改关注状态-异常-参数异常', async () => {
    try {
      await request.post('/focus/changeFocusStatus/' + errorId)
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.post('/focus/changeFocusStatus/' + trueId)
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.post('/focus/changeFocusStatus/' + trueId + '?follow=')
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
    try {
      await request.post('/focus/changeFocusStatus/' + trueId + '?follow=' + followWrong)
    }catch (e){
      expect(e.response.status).toEqual(400)
      expect(e.response.data.code).toEqual(4000)
    }
  })

  test('修改关注状态-异常-业务异常-不能关注用户自己', async () => {
    const { data } = await request.post('/focus/changeFocusStatus/' + selfId + '?follow=true')
    expect(data.code).toEqual(1400)
  })

  test('修改关注状态-异常-业务异常-关注用户不存在', async () => {
    const { data } = await request.post('/focus/changeFocusStatus/' + notExistId + '?follow=true')
    expect(data.code).toEqual(1401)
  })

  test('修改关注状态-成功', async () => {
    const { data } = await request.post('/focus/changeFocusStatus/' + trueId + '?follow=true')
    expect(data.code).toEqual(0)
    expect(data.data.focusStatus).not.toEqual(FocusStatus.NoFollow)
  })
})
