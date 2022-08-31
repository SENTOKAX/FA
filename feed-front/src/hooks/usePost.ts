import { useCallback } from 'react'
import { Toast } from 'antd-mobile'
import { useRequest } from 'ahooks'

import * as api from '@/service/post.service'
import { postStore } from '@/store/postStore'
import { IPost } from '@/libs/types'

export default function usePost() {
  const {
    hasNext,
    setHasNext,
    posts,
    setPost,
    setLastRequestId,
    lastRequestId,
    setHasNew,
    setLoading,
    setError,
    setFirst,
  } = postStore

  const create = useCallback(
    async (content: string, images: string[]) => {
      const res = await api.create(content, images)
      if (res.data.code === 0) {
        Toast.show({
          icon: 'success',
          content: '发帖成功',
        })
        setPost([res.data.data].concat(posts))
      } else {
        Toast.show({
          icon: 'fail',
          content: res.data.message,
        })
      }
      return res.data
    },
    [posts, setPost]
  )
  const getPostList = useCallback(
    async (next?: string, limit?: number, prev?: string) => {
      try {
        setLoading(true)
        setError('')
        const res = await api.getPostList(next, limit, prev)
        const { list } = res.data.data
        if (res.data.code === 0) {
          setPost(list)
          setHasNext(res.data.data.hasNext)
          if (list.length > 0) {
            setLastRequestId(list[0]._id)
          }
        } else {
          Toast.show(res.data.message)
          setError(res.data.message)
        }
      } catch (error: any) {
        Toast.show(error.message)
        setError(error.message)
      } finally {
        setLoading(false)
        setFirst(false)
      }
    },
    [setError, setFirst, setHasNext, setLastRequestId, setLoading, setPost]
  )

  const loadMore = useCallback(async () => {
    try {
      const res = await api.getPostList(posts[posts.length - 1]._id)
      if (res.data.code === 0) {
        const { list } = res.data.data
        setPost(posts.concat(list))
        setHasNext(res.data.data.hasNext)
      } else {
        Toast.show(res.data.message)
      }
    } catch (error: any) {
      Toast.show(error.message)
      throw error
    }
  }, [posts, setHasNext, setPost])

  const getPostStatus = useCallback(async () => {
    const res = await api.getPostStatus(lastRequestId)
    if (res.code === 0) {
      setHasNew(res.data.hasNew)
    } else {
      Toast.show({
        icon: 'fail',
        content: res.message,
      })
    }
  }, [lastRequestId, setHasNew])

  const { run, cancel } = useRequest(getPostStatus, {
    pollingInterval: 3000,
    manual: true,
  })

  const loadNewest = useCallback(async () => {
    const res = await api.getNewPost(lastRequestId)
    if (res.code === 0) {
      const { list } = res.data
      if (list.length > 0) {
        const { list } = res.data
        setPost([...list, ...posts])
        setLastRequestId(list[0]._id)
      }
    } else {
      Toast.show({
        icon: 'fail',
        content: res.message,
      })
    }
  }, [lastRequestId, posts, setLastRequestId, setPost])

  const likePost = useCallback(
    (id: string, status: boolean) => {
      try {
        setPost(
          posts.map((item) => {
            if (item._id === id) {
              item.like = status
              status ? item.likes++ : item.likes--
              return Object.assign({}, item)
            }
            return item
          })
        )
        api.changeLikeStatus(id, status)
      } catch (error: any) {
        Toast.show(error.message)
        setPost(
          posts.map((item) => {
            if (item._id === id) {
              item.like = status
              status ? item.likes-- : item.likes++
              return Object.assign({}, item)
            }
            return item
          })
        )
      }
    },
    [posts, setPost]
  )
  const transmit = useCallback(
    async (content: string, images: string[], relationId: string, transmit: IPost) => {
      const res = await api.transmit(content, images, relationId)
      if (res.data.code === 0) {
        Toast.show({
          icon: 'success',
          content: '转发成功',
        })
        setPost(
          posts.map((item) => {
            if (item._id === relationId) {
              item.transmits++
              return Object.assign({}, item)
            }
            return item
          })
        )
        const post: IPost = {
          ...res.data.data,
          relation: transmit,
        }
        setPost([post].concat(posts))
      } else {
        Toast.show({
          icon: 'fail',
          content: res.data.message,
        })
      }
      return res.data
    },
    [posts, setPost]
  )

  const reply = useCallback(
    async (content: string, images: string[], relationId: string) => {
      const res = await api.reply(content, images, relationId)
      if (res.data.code === 0) {
        Toast.show({
          icon: 'success',
          content: '回复成功',
        })
        setPost(
          posts.map((item) => {
            if (item._id === relationId) {
              item.replays++
              return Object.assign({}, item)
            }
            return item
          })
        )
      } else {
        Toast.show({
          icon: 'fail',
          content: res.data.message,
        })
      }
      return res.data
    },
    [posts, setPost]
  )

  const delPost = useCallback(
    async (id: string) => {
      const res = await api.delPost(id)
      if (res.data.code === 0) {
        setPost(posts.filter((item) => item._id !== id))
        Toast.show({
          icon: 'success',
          content: '删除成功',
        })
      } else {
        Toast.show({
          icon: 'fail',
          content: res.data.message,
        })
      }
      return res.data
    },
    [posts, setPost]
  )

  return {
    likePost,
    create,
    getPostList,
    transmit,
    reply,
    delPost,
    hasNext,
    loadMore,
    run,
    cancel,
    loadNewest,
  }
}
