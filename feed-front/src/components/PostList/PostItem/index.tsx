import React, { useRef } from 'react'
import { ActionSheet, Dialog } from 'antd-mobile'
import { MoreOutline } from 'antd-mobile-icons'
import { Action, ActionSheetShowHandler } from 'antd-mobile/es/components/action-sheet'
import { useNavigate } from 'react-router-dom'

import styles from './style.module.scss'
import PopComment from '../../PopComment'
import PopRepost from '../../PopRepost'
import usePost from '@/hooks/usePost'
import PostContent from '@/components/PostContent'
import { formatTime } from '@/utils/time'
import { IPost, PostType } from '@/libs/types'
import { userStore } from '@/store/userStore'
import { ReactComponent as IconLike } from '@/assests/imgs/like.svg'
import { ReactComponent as IconFillLike } from '@/assests/imgs/like_fill.svg'

interface IProps {
  post: IPost
  onCommentSuccess?: (comment: IPost) => void
  onTransmitSuccess?: (transmit: IPost) => void
  onClickLike?: (like: boolean) => void
  onDeleteSuccess?: () => void
}
export default function PostItem({
  post,
  onCommentSuccess,
  onTransmitSuccess,
  onClickLike,
  onDeleteSuccess,
}: IProps) {
  const navigate = useNavigate()
  const {
    content,
    images,
    relation,
    createAt,
    _id,
    replays,
    likes,
    like,
    transmits,
    processImages
  } = post

  const { delPost } = usePost()
  const { avatar, nickname, account } = post.user
  const handler = useRef<ActionSheetShowHandler>()
  const actions: Action[] = [
    {
      text: '删除帖子',
      key: 'delete',
      danger: true,
      onClick: async () => {
        const result = await Dialog.confirm({ content: '确定要删除吗？' })
        if (result) {
          const { code } = await delPost(_id)
          if (code === 0) {
            onDeleteSuccess && onDeleteSuccess()
            handler.current?.close()
          }
        }
      },
    },
  ]
  return (
    <div className={styles.post}>
      <div className={styles.left}>
        <div
          className={styles.avatar}
          onClick={() => {
            if (window.location.pathname.split('/')[2] !== account)
              navigate(`/user/${account}`)
          }}
        >
          <img src={avatar} alt="" />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.info}>
          <span className={styles.name}>{nickname}</span>
          <span className={styles.time}>{'@' + account + ' · ' + formatTime(createAt)}</span>
          {post.user._id === userStore.user._id ? (
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
        {post.type === PostType.Replay ? (
          <div
            className={styles.reply}
            onClick={() => {
              if (window.location.pathname.split('/')[2] !== post.relation?.user.account) navigate(`/user/${post.relation?.user.account}`)
            }}
          >
            回复
            <span>{` @${post.relation?.user.account}`}</span>
          </div>
        ) : null
        }

        <div className={styles.content}>
          <PostContent _id={_id} content={content} images={images} transmit={post?.type === PostType.Transmit ? relation : undefined} processImages={processImages} />
        </div>
        <div className={styles.operate}>
          <div className={styles.operateItem}>
            <PopComment onCommentSuccess={onCommentSuccess} post={post} />
            <div className={styles.count}>{replays}</div>
          </div>
          <div className={styles.operateItem}>
            <PopRepost onRepostSuccess={onTransmitSuccess} post={post} />
            <div className={styles.count}>{transmits}</div>
          </div>
          <div className={styles.operateItem}>
            <div onClick={() => onClickLike && onClickLike(!like)} className={styles.icon}>
              {like ? <IconFillLike /> : <IconLike />}
            </div>
            <div className={styles.count}>{likes}</div>
          </div>
        </div>
      </div>

    </div>

  )
}
