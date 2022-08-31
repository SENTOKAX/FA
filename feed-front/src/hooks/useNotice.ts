import { useCallback } from 'react'
import { Toast } from 'antd-mobile'
import { useRequest } from 'ahooks'

import * as api from '@/service/notify.service'
import { INotice } from '@/libs/types'
import { noticeStore } from '@/store/noticeStore'

export default function useNotice() {
  const { setHasNext, notices, setNotice, setUnRead, setLoading, setError } = noticeStore
  const noticeList = useCallback(
    async (next?: string, limit?: number, prev?: string) => {
      try {
        setLoading(true)
        setError('')
        const res = await api.noticeList(next, limit, prev)
        if (res.data.code === api.SUCCESS) {
          const { items } = res.data.data
          setNotice(items)
          setHasNext(res.data.data.hasNext)
          setUnRead(res.data.data.unread)
        } else {
          Toast.show({
            icon: 'fail',
            content: res.data.message,
          })
        }
        return res.data
      } catch (error: any) {
        Toast.show(error.message)
        setError(error.message)
      }finally{
        setLoading(false)
      }
    },
    [setError, setHasNext, setLoading, setNotice, setUnRead]
  )

  const loadMore = useCallback(async () => {
    const res = await api.noticeList(notices[notices.length - 1]._id)
    if (res.data.code === api.SUCCESS) {
      const { items } = res.data.data
      setNotice(notices.concat(items))
      setHasNext(res.data.data.hasNext)
      setUnRead(res.data.data.unread)
    } else {
      Toast.show({
        icon: 'fail',
        content: res.data.message,
      })
    }
  }, [notices, setHasNext, setNotice, setUnRead])
  const loadNewest = useCallback(async () => { 
    const res = await api.noticeList(undefined, undefined,notices.length === 0?undefined: notices[0]._id)
    if (res.data.code === api.SUCCESS) {
      const { items } = res.data.data
      setNotice([...items, ...notices])
      setUnRead(res.data.data.unread)
    } else {
      Toast.show({
        icon: 'fail',
        content: res.data.message,
      })
    }
  }, [notices, setNotice, setUnRead])
  const deleteNotice = useCallback(
    async (ids: string) => {
      const res = await api.deleteNotice(ids)
      if (res.code === api.SUCCESS) {
        const _notices = JSON.parse(JSON.stringify(notices))
        const target = _notices.find((item: INotice) => item._id === ids)
        const index = _notices.indexOf(target as INotice)
        _notices.splice(index, 1)
        setNotice(_notices)
        Toast.show({
          icon: 'success',
          content: '删除成功',
        })
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message,
        })
      }
    },
    [notices, setNotice]
  )
  const readNotice = useCallback(
    async (ids: string) => {
      const res = await api.readNotice(ids)
      if (res.code === api.SUCCESS) {
        const _notices = JSON.parse(JSON.stringify(notices))
        const target = _notices.find((item: INotice) => item._id === ids)
        target.isRead = true
        setNotice(_notices)
      } else {
        Toast.show({
          icon: 'fail',
          content: res.message,
        })
      }
    },
    [notices, setNotice]
  )
  const { run, cancel } = useRequest(loadNewest, {
    pollingInterval: 3000,
    manual: true,
  })
  return { noticeList, deleteNotice, readNotice, loadMore, run, cancel ,loadNewest }
}
