import request from './request'

export const SUCCESS = 0

export const changeFocusStatus = async (uid: string, follow: boolean) => {
  const { data } = await request.post(`/focus/changeFocusStatus/${uid}?follow=${follow}`)
  return data
}
