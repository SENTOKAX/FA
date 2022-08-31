import { useCallback, useEffect, useRef, useState } from 'react'
import { Toast } from 'antd-mobile'
import { useInViewport } from 'ahooks'

import { IPost } from '@/libs/types'
import { searchPost, SUCCESS } from '@/service/post.service'
import usePost from './usePost'

export default function usePostList(filter?: {
  keyword?: string
  account?: string
  image?: boolean
  like?: boolean
  likeFor?: string
}) {
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<IPost[]>([])

  const [firstLoad, setFirstLoad] = useState(true)
  const [cacheFilter, setCacheFilter] = useState(filter)
  const ref = useRef(null)
  const [inViewport] = useInViewport(ref)
  const { likePost } = usePost()
  const loadPosts = useCallback(
    async (filter?: {
      keyword?: string
      account?: string
      image?: boolean
      like?: boolean
      likeFor?: string
    }) => {
      try {
        setLoading(true)
        setError('')
        const { code, message, data } = await searchPost(filter)
        if (code === SUCCESS) {
          setPosts(data.list)
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
      loadPosts(filter).then()
      setCacheFilter(filter)
      setFirstLoad(false)
    } else if (inViewport && firstLoad) {
      loadPosts(filter).then()
      setFirstLoad(false)
    }
  }, [cacheFilter, filter, firstLoad, inViewport, loadPosts])

  const loadMorePosts = useCallback(async () => {
    const { code, message, data } = await searchPost(filter, {
      next: posts.length > 0 ? posts[posts.length - 1]._id : undefined,
    })
    if (code === SUCCESS) {
      setPosts(posts.concat(data.list))
      setHasNext(data.hasNext)
    } else {
      Toast.show(message)
      setError(message)
    }
  }, [filter, posts])

  const onPostCommentSuccess = useCallback(
    (id: string) => {
      setPosts(
        posts.map((post) => {
          if (id === post._id) {
            return Object.assign(post, { replays: post.replays + 1 })
          }
          return post
        })
      )
    },
    [posts]
  )

  const onPostRepostSuccess = useCallback(
    (id: string) => {
      setPosts(
        posts.map((post) => {
          if (id === post._id) {
            return Object.assign(post, { transmits: post.transmits + 1 })
          }
          return post
        })
      )
    },
    [posts]
  )

  const onPostClickLike = useCallback(
    (id: string, like: boolean) => {
      try {
        setPosts(
          posts.map((post) => {
            if (id === post._id) {
              return Object.assign(post, { likes: post.likes + (like ? 1 : -1), like })
            }
            return post
          })
        )
        likePost(id, like)
      } catch (error: any) {
        Toast.show(error.message)
        setPosts(
          posts.map((post) => {
            if (id === post._id) {
              return Object.assign(post, { likes: post.likes + (like ? -1 : 1), like })
            }
            return post
          })
        )
      }
    },
    [likePost, posts]
  )

  const onDeleteSuccess = useCallback(
    (id: string) => {
      setPosts(posts.filter((item) => item._id !== id))
    },
    [posts]
  )

  return {
    loading,
    hasNext,
    error,
    posts,
    loadPosts,
    loadMorePosts,
    onPostCommentSuccess,
    onPostRepostSuccess,
    onPostClickLike,
    onDeleteSuccess,
    ref,
  }
}
