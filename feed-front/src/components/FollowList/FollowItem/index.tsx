import React from 'react'
import { Avatar, Button, Ellipsis } from 'antd-mobile'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'

import styles from './style.module.scss'
import { FollowStatus, IUser } from '@/libs/types'

interface Props {
  follow: IUser
  onClickChangeFocusStatus?: (follow: boolean) => void
}

export default function FollowItem({ follow, onClickChangeFocusStatus }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.post_item} onClick={() => {
      navigate(`/user/${follow.account}`)
    }}>
      <Avatar
        src={follow.avatar}
        className={styles.avatar_post}
      />
      <div className={styles.post_content}>
        <div className={styles.pc_top}>
          <span className={styles.name}>{follow.nickname}</span>
          <Button
            className={classNames(styles.button, {
              [styles.btn_following]:
                follow?.focusStatus &&
                [FollowStatus.HasFollow, FollowStatus.HasEachFollowed].includes(follow.focusStatus),
              [styles.btn_follow]:
                follow?.focusStatus &&
                [FollowStatus.HasBeFollowed, FollowStatus.NoFollow].includes(follow.focusStatus),
              [styles.btn_hidden]: follow.focusStatus === FollowStatus.Self,
            })}
            shape="rounded"
            onClick={(event) => {
              if (
                follow?.focusStatus &&
                [FollowStatus.HasFollow, FollowStatus.HasEachFollowed].includes(follow.focusStatus)
              ) {
                onClickChangeFocusStatus && onClickChangeFocusStatus(false)
              } else if (
                follow?.focusStatus &&
                [FollowStatus.HasBeFollowed, FollowStatus.NoFollow].includes(follow.focusStatus)
              ) {
                onClickChangeFocusStatus && onClickChangeFocusStatus(true)
              }
              event.stopPropagation()
            }}
          >
            {follow.focusStatus === FollowStatus.HasFollow
              ? '正在关注'
              : follow.focusStatus === FollowStatus.HasBeFollowed
                ? '回关'
                : follow.focusStatus === FollowStatus.HasEachFollowed
                  ? '已互关'
                  : follow.focusStatus === FollowStatus.NoFollow
                    ? '关注'
                    : ''}
          </Button>
        </div>
        <span>{'@' + follow.account}</span>
        <div className={styles.pc_middle}>
          <Ellipsis direction="end" rows={1} content={follow.bio || '暂无个人介绍'} />
        </div>
      </div>
    </div>
  )
}
