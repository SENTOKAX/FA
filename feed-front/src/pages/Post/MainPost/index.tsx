import React from 'react'
import { Avatar } from 'antd-mobile'

import styles from './style.module.scss'
import PostContent from '@/components/PostContent'
import { formatTime } from '@/utils/time'
import { useNavigate } from 'react-router-dom'
import PopComment from '@/components/PopComment'
import PopRepost from '@/components/PopRepost'
import { IPost, PostType } from '@/libs/types'
import { ReactComponent as IconLikeActive } from '@/assests/imgs/like_fill.svg'
import { ReactComponent as IconLike } from '@/assests/imgs/like.svg'

type Props = {
  post: IPost,
  relation: IPost,
  onRelationClickLike: (like: boolean) => void
  onRelationCommentSuccess: (post: IPost) => void
  onRelationRepostSuccess: (post: IPost) => void
}

const MainPost = ({ post, relation, onRelationClickLike, onRelationCommentSuccess, onRelationRepostSuccess }: Props) => {
  const navigate = useNavigate()
  return (
    <div className={styles.wrapper}>
      {
        relation && post?.type === PostType.Replay && <div className={styles.relation}>
          <div className={styles.left}>
            <Avatar className={styles.avatar} src={relation?.user.avatar} />
            <div className={styles.connector} />
          </div>
          <div className={styles.right}>
            <div className={styles['relation-user']}>
              <span className={styles.nickname}>{relation?.user.nickname}</span>
              <span className={styles.account}>{`@${relation?.user.account} · ${formatTime(relation?.createAt)}`}</span>
            </div>
            <PostContent _id={relation?._id} className={styles.post} content={relation?.content} images={relation?.images} processImages={relation?.processImages} />
            <div className={styles.operation}>
              <span className={styles['operation-item']}><PopComment onCommentSuccess={onRelationCommentSuccess} post={relation} /><span className={styles.number}>{relation.replays}</span></span>
              <span className={styles['operation-item']}><PopRepost onRepostSuccess={onRelationRepostSuccess} post={relation} /><span className={styles.number}>{relation.transmits}</span></span>
              <span onClick={() => onRelationClickLike(!relation.like)} className={styles['operation-item']}>{relation.like ? <IconLikeActive /> : <IconLike />}<span className={styles.number}>{relation.likes}</span></span>
            </div>
          </div>
        </div>
      }
      <div className={styles.user}>
        <Avatar className={styles.avatar} src={post?.user.avatar} onClick={() => navigate(`/user/${post?.user.account}`)} />
        <div className={styles.info}>
          <div className={styles.nickname}>{post?.user.nickname}</div>
          <div className={styles.account}>{`@${post?.user.account}`}</div>
        </div>
      </div>
      <div className={styles.reply}>
        {
          relation && post?.type === PostType.Replay && <div className={styles.replyTo}>
            <span className={styles.tag}>回复</span>
            <span className={styles.user}>{`@${relation?.user.account}`}</span>
          </div>
        }
        <PostContent _id={post?._id} className={styles.post} images={post?.images} content={post?.content} transmit={post?.type === PostType.Transmit ? relation : undefined} processImages={post?.processImages} />
      </div>
    </div>
  )
}

export default MainPost
