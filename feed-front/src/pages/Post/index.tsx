import React, { useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import { ActionSheet, Dialog, Empty, InfiniteScroll, NavBar, PullToRefresh, Skeleton } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { Action, ActionSheetShowHandler } from 'antd-mobile/es/components/action-sheet'
import classNames from 'classnames'
import { MoreOutline } from 'antd-mobile-icons'

import styles from './style.module.scss'
import { ReactComponent as IconBack } from '@/assests/imgs/back.svg'
import { ReactComponent as IconLike } from '../../assests/imgs/like.svg'
import { ReactComponent as IconLikeActive } from '../../assests/imgs/like_fill.svg'
import usePostAndReplyList from '@/hooks/usePostAndReplyList'
import Reply from '@/pages/Post/Reply'
import MainPost from '@/pages/Post/MainPost'
import PopComment from '@/components/PopComment'
import PopRepost from '@/components/PopRepost'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import PostSkeleton from '@/components/PostSkeleton'
import Error from '@/components/Error'
import { userStore } from '@/store/userStore'
import usePost from '@/hooks/usePost'
import { IPost } from '@/libs/types'

const Post = () => {
  const navigate = useNavigate()
  const params = useParams()
  const scroll = useRef<HTMLDivElement | null>(null)
  const {
    post,
    relation,
    onClickLike,
    onClickReplyLike,
    onCommentSuccess,
    onRepostSuccess,
    replays,
    hasNext,
    loadMoreReply,
    onReplyCommentSuccess,
    onReplyRepostSuccess,
    onRelationClickLike,
    onRelationCommentSuccess,
    onRelationRepostSuccess,
    onDeleteCommentSuccess,
    postLoading,
    postError,
    replyLoading,
    replyError,
    loadReply,
  } = usePostAndReplyList(params.id || '', scroll)

  const renderReplyList = useMemo(() => {
    return (
      <>
        {replays.map((reply) => (
          <div key={reply._id} className={styles.replyItem}>
            <Reply
              onReplyCommentSuccess={() => onReplyCommentSuccess(reply._id)}
              onReplyRepostSuccess={() => onReplyRepostSuccess(reply._id)}
              onClickReplyLike={(like) => onClickReplyLike(reply._id, like)}
              onDeleteCommentSuccess={() => onDeleteCommentSuccess(reply._id)}
              reply={reply}
              replyTo={post?.user.account || ''}
              postOwner={post?.user._id}
            />
          </div>
        ))}
      </>
    )
  }, [
    onClickReplyLike,
    onDeleteCommentSuccess,
    onReplyCommentSuccess,
    onReplyRepostSuccess,
    post?.user._id,
    post?.user.account,
    replays,
  ])
  const { delPost } = usePost()
  const handler = useRef<ActionSheetShowHandler>()
  const actions: Action[] = [
    {
      text: '删除帖子',
      key: 'delete',
      danger: true,
      onClick: async () => {
        const result = await Dialog.confirm({ content: '确定要删除吗？' })
        if (result) {
          const { code } = await delPost(post._id)
          if (code === 0) {
            navigate('/')
            handler.current?.close()
          }
        }
      },
    },
  ]
  const renderReply = useMemo(() => {
    if (replyError) {
      return (
        <div className={classNames(styles['replay-error'], styles['button-wrapper'])}>
          <Error
            noneImage
            title="评论加载失败"
            button={
              <div
                onClick={async () => {
                  await loadReply()
                }}
                className={styles.button}
              >
                重新加载
              </div>
            }
          />
        </div>
      )
    } else if (replyLoading && replays.length === 0) {
      return (
        <div className={styles['reply-skeleton']}>
          <Skeleton.Paragraph lineCount={5} animated />
        </div>
      )
    }
    return (
      <>
        <div className={styles.replyList}>{renderReplyList}</div>
        {replays.length === 0 ? (
          <Empty image={null} className={styles.empty} description="暂无评论" />
        ) : (
          <InfiniteScroll hasMore={hasNext} loadMore={loadMoreReply}>
            {(hasMore: boolean, failed: boolean, retry: () => void) => {
              return <InfiniteScrollContent hasMore={hasMore} failed={failed} retry={retry} />
            }}
          </InfiniteScroll>
        )}
      </>
    )
  }, [hasNext, loadMoreReply, loadReply, renderReplyList, replays.length, replyError, replyLoading])

  const renderContent = useMemo(() => {
    if (postError) {
      return (
        <div className={classNames(styles['post-error'], styles['button-wrapper'])}>
          <Error title={postError} button={<div className={styles.button}>搜索</div>} />
        </div>
      )
    }
    return (
      <>
        {!postLoading && (
          <PullToRefresh onRefresh={loadReply}>
            <div className={styles.post}>
              <MainPost
                onRelationClickLike={onRelationClickLike}
                onRelationRepostSuccess={onRelationRepostSuccess}
                onRelationCommentSuccess={onRelationCommentSuccess}
                post={post as IPost}
                relation={relation as IPost}
              />
              <div className="time">{dayjs(post?.createAt).format('YYYY-MM-DD HH:mm')}</div>
            </div>
          </PullToRefresh>
        )}
        {postLoading && <PostSkeleton wrapperClassName={styles.skeleton} />}
        <div className={styles.postList}>
          {!postLoading && (
            <div className={styles.postInfo}>
              <span>
                <span className={styles.number}>{post?.transmits || 0}</span>转发
              </span>
              <span>
                <span className={styles.number}>{post?.likes || 0}</span>喜欢
              </span>
            </div>
          )}
          <div className={styles.postOperation}>
            <PopComment onCommentSuccess={onCommentSuccess} post={post} />
            <PopRepost onRepostSuccess={onRepostSuccess} post={post} />
            <span className={styles.operation} onClick={() => onClickLike(!post?.like)}>
              {post?.like ? <IconLikeActive /> : <IconLike />}
            </span>
          </div>
        </div>
        {renderReply}
      </>
    )
  }, [loadReply, onClickLike, onCommentSuccess, onRelationClickLike, onRelationCommentSuccess, onRelationRepostSuccess, onRepostSuccess, post, postError, postLoading, relation, renderReply])

  return (
    <div className={styles.main} ref={scroll}>
      <NavBar
        className={styles.nav}
        backArrow={<IconBack />}
        onBack={() => navigate(-1)}
        style={{ margin: '0 8px', fontSize: '16px' }}
        right={
          post.user._id === userStore.user._id ? (
            <div
              className={styles.menu}
              onClick={() => {
                handler.current = ActionSheet.show({
                  actions,
                  extra: '请选择要执行的操作',
                  cancelText: '取消',
                })
              }}
            >
              <MoreOutline fontSize={24} color="#333" />
            </div>
          ) : null
        }
      >
        <span className={styles.navTitle}>主题帖</span>
      </NavBar>
      {renderContent}
    </div>
  )
}

export default Post
