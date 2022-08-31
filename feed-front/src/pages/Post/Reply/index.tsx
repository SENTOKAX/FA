import React, { useRef } from 'react'
import { Action, ActionSheetShowHandler } from 'antd-mobile/es/components/action-sheet'
import usePost from '@/hooks/usePost'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { MoreOutline } from 'antd-mobile-icons'
import { ActionSheet, Avatar, Dialog } from 'antd-mobile'

import styles from './style.module.scss'
import { IPost } from '@/libs/types'
import { formatTime } from '@/utils/time'
import PostContent from '@/components/PostContent'
import { ReactComponent as IconLike } from '@/assests/imgs/like.svg'
import { ReactComponent as IconLikeActive } from '@/assests/imgs/like_fill.svg'
import PopComment from '@/components/PopComment'
import PopRepost from '@/components/PopRepost'
import { userStore } from '@/store/userStore'


type Props = {
  className?: string
  reply: IPost
  replyTo: string
  postOwner: string
  onClickReplyLike: (like: boolean) => void
  onReplyCommentSuccess: (post: IPost) => void
  onReplyRepostSuccess: (post: IPost) => void
  onDeleteCommentSuccess: () => void
}

const Reply = ({
  className,
  reply,
  replyTo,
  postOwner,
  onClickReplyLike,
  onReplyCommentSuccess,
  onReplyRepostSuccess,
  onDeleteCommentSuccess
}: Props) => {
  const navigate = useNavigate()
  const { delPost } = usePost()
  const handler = useRef<ActionSheetShowHandler>()
  const actions: Action[] = [
    {
      text: '删除回复',
      key: 'delete',
      danger: true,
      onClick: async () => {
        const result = await Dialog.confirm({ content: '确定要删除吗？' })
        if (result) {
          const { code } = await delPost(reply._id)
          if (code === 0) {
            onDeleteCommentSuccess && onDeleteCommentSuccess()
            handler.current?.close()
          }
        }
      },
    },
  ]
  return (
    <div className={classNames(className, styles.wrapper)}>
      <Avatar
        className={styles.avatar}
        src={reply.user.avatar}
        onClick={() => navigate(`/user/${reply.user.account}/posts`)}
      />
      <div className={styles.container}>
        <div className={styles.user}>
          <div className={styles.left}>
            <span className={styles.nickname}>{reply.user.nickname}</span>
            <span className={styles.account}>{`@${reply.user.account} · ${formatTime(
              reply.createAt
            )}`}</span>
          </div>
          {reply.user._id === userStore.user._id || postOwner === userStore.user._id ? (
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
              <MoreOutline fontSize={24} color="var(--adm-color-weak)" />
            </div>
          ) : null}
        </div>
        <div className={styles.replyTo}>
          <span className={styles.tag}>回复</span>
          <span className={styles.user} onClick={()=>{navigate(`/user/${replyTo}`)}}>{`@${replyTo}`}</span>
        </div>
        <div
          onClick={() => {
            navigate(`/post/${reply._id}`)
          }}
          className={styles.content}
        >
          {reply && (
            <PostContent className={styles.post} content={reply.content} images={reply.images} processImages={reply.processImages} />
          )}
        </div>
        <div className={styles.operation}>
          <span className={styles['operation-item']}>
            <PopComment onCommentSuccess={onReplyCommentSuccess} post={reply} />
            <span className={styles.number}>{reply.replays}</span>
          </span>
          <span className={styles['operation-item']}>
            <PopRepost onRepostSuccess={onReplyRepostSuccess} post={reply} />
            <span className={styles.number}>{reply.transmits}</span>
          </span>
          <span onClick={() => onClickReplyLike(!reply.like)} className={styles['operation-item']}>
            {reply.like ? <IconLikeActive /> : <IconLike />}
            <span className={styles.number}>{reply.likes}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Reply
