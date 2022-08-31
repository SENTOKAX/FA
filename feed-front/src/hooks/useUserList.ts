import { useCallback, useEffect, useRef, useState } from 'react'
import { Toast } from 'antd-mobile'
import { useInViewport } from 'ahooks'

import { IUser } from '@/libs/types'
import { searchUser, SUCCESS } from '@/service/user.service'
import { changeFocusStatus } from '@/service/focus.service'

export default function useUserList(filter?: { keyword?: string; uid?: string; follow?: number }) {
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<IUser[]>([])

  const [firstLoad, setFirstLoad] = useState(true)
  const [cacheFilter, setCacheFilter] = useState(filter)
  const ref = useRef(null)
  const [inViewport] = useInViewport(ref)

  const loadUsers = useCallback(
    async (filter?: { keyword?: string; uid?: string; follow?: number }) => {
      try {
        setLoading(true)
        setError('')
        const { code, message, data } = await searchUser(filter)
        if (code === SUCCESS) {
          setUsers(data.list)
          setHasNext(data.hasNext)
        } else {
          Toast.show(message)
          setError(message)
        }
      } catch (error: any) {
        setError(error.message)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (inViewport && cacheFilter !== filter) {
      loadUsers(filter).then()
      setCacheFilter(filter)
      setFirstLoad(false)
    } else if (inViewport && firstLoad) {
      loadUsers(filter).then()
      setFirstLoad(false)
    }
  }, [cacheFilter, filter, firstLoad, inViewport, loadUsers])
  const loadMoreUsers = useCallback(async () => {
    const { code, message, data } = await searchUser(filter, {
      next: users.length > 0 ? users[users.length - 1]._id : undefined,
    })
    if (code === SUCCESS) {
      setUsers(users.concat(data.list))
      setHasNext(data.hasNext)
    } else {
      Toast.show(message)
      setError(message)
    }
  }, [filter, users])

  const onClickChangeFollow = useCallback(
    async (uid: string, follow: boolean) => {
      const { code, data } = await changeFocusStatus(uid, follow)
      if (code === SUCCESS) {
        setUsers(
          users.map((user) => {
            if (user._id === uid) return Object.assign(user, { focusStatus: data.focusStatus })
            return user
          })
        )
        Toast.show({
          content: follow ? '关注成功' : '取消关注成功',
          duration: 1000,
        })
      }
    },
    [users]
  )

  return {
    loading,
    hasNext,
    error,
    users,
    loadUsers,
    loadMoreUsers,
    onClickChangeFollow,
    ref,
  }
}
