import { MutableRefObject, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { getPostInfoById, getPostReply, SUCCESS } from '@/service/post.service'
import { Toast } from 'antd-mobile'
import { DefaultPost, IPost } from '@/libs/types'
import { useScroll } from 'ahooks'
import usePost from './usePost'

type Cache = {
  post: IPost
  relation: IPost | null
  replays: IPost[]
  position: {
    left: number
    top: number
  }
}

export default function usePostAndReplyList(
  initPostId: string,
  ref?: MutableRefObject<HTMLElement | null>
) {
  const [hasNext, setHasNext] = useState(false)
  const [post, setPost] = useState<IPost>(DefaultPost)
  const [relation, setRelation] = useState<IPost | null>(null)
  const [replays, setReplays] = useState<IPost[]>([])
  const { likePost } = usePost()
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')

  const [cacheList, setCacheList] = useState<Map<string, Cache>>(new Map())
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
  })

  const scroll = useScroll(ref)

  const loadPostInfo = useCallback(async () => {
    try {
      setPostLoading(true)
      setPostError('')
      const { code, message, data } = await getPostInfoById(initPostId)
      if (code === SUCCESS) {
        setPost(data.post)
        setRelation(data.relation)
      } else {
        Toast.show(message)
        setPostError(message)
      }
    } catch (error: any) {
      Toast.show(error.message)
      setPostError(error.message)
    } finally {
      setPostLoading(false)
    }
  }, [initPostId])

  const loadReply = useCallback(async () => {
    try {
      setReplyLoading(true)
      setReplyError('')
      const { code, message, data } = await getPostReply(initPostId)
      if (code === SUCCESS) {
        setReplays(data.list)
        setHasNext(data.hasNext)
      } else {
        Toast.show(message)
        setReplyError(message)
      }
    } catch (error: any) {
      Toast.show(error.message)
      setReplyError(error.message)
    } finally {
      setReplyLoading(false)
    }
  }, [initPostId])

  const loadMoreReply = useCallback(async () => {
    try {
      const { code, message, data } = await getPostReply(initPostId, {
        next: replays.length > 0 ? replays[replays.length - 1]._id : '',
      })
      if (code === SUCCESS) {
        setReplays(replays.concat(data.list))
        setHasNext(data.hasNext)
      } else {
        Toast.show(message)
      }
    } catch (error: any) {
      Toast.show(error.message)
      throw error
    }
  }, [initPostId, replays])

  const onDeleteCommentSuccess = useCallback(
    (id: string) => {
      setReplays(replays.filter((reply) => reply._id !== id))
    },
    [replays]
  )

  const onReplyCommentSuccess = useCallback(
    async (id: string) => {
      setReplays(
        replays.map((reply) => {
          if (id === reply._id) {
            return Object.assign(reply, { replays: reply.replays + 1 })
          }
          return reply
        })
      )
    },
    [replays]
  )

  const onReplyRepostSuccess = useCallback(
    async (id: string) => {
      setReplays(
        replays.map((reply) => {
          if (id === reply._id) {
            return Object.assign(reply, { transmits: reply.transmits + 1 })
          }
          return reply
        })
      )
    },
    [replays]
  )

  const onClickReplyLike = useCallback(
    (id: string, like: boolean) => {
      try {
        setReplays(
          replays.map((reply) => {
            if (id === reply._id) {
              return Object.assign(reply, { likes: reply.likes + (like ? 1 : -1), like })
            }
            return reply
          })
        )
        likePost(id, like)
      } catch (error: any) {
        Toast.show(error.message)
        setReplays(
          replays.map((reply) => {
            if (id === reply._id) {
              return Object.assign(reply, { likes: reply.likes + (like ? -1 : 1), like })
            }
            return reply
          })
        )
      }
    },
    [likePost, replays]
  )

  const onCommentSuccess = useCallback(
    (comment: IPost) => {
      setPost(Object.assign({}, post, { replays: (post?.replays || 0) + 1 }))
      setReplays([comment].concat(replays))
    },
    [post, replays]
  )

  const onRepostSuccess = useCallback(() => {
    setPost(Object.assign({}, post, { transmits: (post?.transmits || 0) + 1 }))
  }, [post])

  const onClickLike = useCallback(
    (like: boolean) => {
      try {
        setPost(Object.assign({}, post, { likes: (post?.likes || 0) + (like ? 1 : -1), like }))
        likePost(initPostId, like)
      } catch (error: any) {
        Toast.show(error.message)
        setPost(Object.assign({}, post, { likes: (post?.likes || 0) + (like ? -1 : 1), like }))
      }
    },
    [initPostId, likePost, post]
  )

  const onRelationClickLike = useCallback(
    (like: boolean) => {
      try {
        setRelation(
          Object.assign({}, relation, { likes: (relation?.likes || 0) + (like ? 1 : -1), like })
        )
        likePost(relation?._id || '', like)
      } catch (error: any) {
        Toast.show(error.message)
        setRelation(
          Object.assign({}, relation, { likes: (relation?.likes || 0) + (like ? -1 : 1), like })
        )
      }
    },
    [likePost, relation]
  )

  const onRelationCommentSuccess = useCallback(async () => {
    setRelation(Object.assign({}, relation, { replays: (relation?.replays || 0) + 1 }))
  }, [relation])

  const onRelationRepostSuccess = useCallback(async () => {
    setRelation(Object.assign({}, relation, { transmits: (relation?.transmits || 0) + 1 }))
  }, [relation])

  useEffect(() => {
    if (post !== DefaultPost && initPostId !== post._id) {
      cacheList.set(post._id, {
        post,
        replays,
        relation,
        position: scroll || { left: 0, top: 0 },
      })
      setCacheList(cacheList)
    }
  }, [cacheList, initPostId, post, relation, replays, scroll])

  useEffect(() => {
    if (cacheList.has(initPostId)) {
      const cache = cacheList.get(initPostId)
      if (cache) {
        setRelation(cache.relation)
        setPost(cache.post)
        setReplays(cache.replays)
        setPosition(cache.position)
      }
    } else {
      setPost(DefaultPost)
      setReplays([])
      setRelation(DefaultPost)
      setPosition({
        left: 0,
        top: 0,
      })
      loadPostInfo().then()
      loadReply().then()
    }
  }, [cacheList, initPostId, loadPostInfo, loadReply])

  useLayoutEffect(() => {
    ref?.current?.scroll(position)
  }, [position, ref])

  return {
    postError,
    postLoading,
    replyError,
    replyLoading,
    post,
    relation,
    replays,
    hasNext,
    loadMoreReply,
    onClickLike,
    onReplyCommentSuccess,
    onReplyRepostSuccess,
    onDeleteCommentSuccess,
    onClickReplyLike,
    onCommentSuccess,
    onRepostSuccess,
    onRelationClickLike,
    onRelationCommentSuccess,
    onRelationRepostSuccess,
    loadPostInfo,
    loadReply,
  }
}
