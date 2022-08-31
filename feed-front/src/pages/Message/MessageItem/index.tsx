import React, { useMemo } from 'react'
import classNames from 'classnames'
import { Avatar, SwipeAction } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { Action } from 'antd-mobile/es/components/swipe-action'

import styles from './style.module.scss'
import { formatTime } from '@/utils/time'
import { IMessageSession, IMessageType } from '@/libs/types'

type Props = {
  item: IMessageSession
  clearMessageWatch: () => void
  deleteMessageSession: () => void
}

export default function MessageItem({ item, clearMessageWatch, deleteMessageSession }: Props) {
  const navigate = useNavigate()

  const rightActions = useMemo((): Action[] => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => {
        deleteMessageSession()
      },
    }
  ], [deleteMessageSession])

  return <SwipeAction rightActions={rightActions}>
    <div
      key={item._id}
      onClick={() => {
        clearMessageWatch()
        navigate(`/message/${item.user.account}`)
      }}
      className={styles.item}
    >
      <Avatar className={styles.avatar} src={item.user.avatar} />
      <div className={styles.content}>
        <div className={styles['name-time']}>
          <span className={styles.name}>{item.user.nickname}</span>
          <span className={styles.time}>{formatTime(item.message.createAt)}</span>
        </div>
        <div className={styles['message-number']}>
          <span className={styles.message}>
            {item.message.type === IMessageType.Image ? '[图片]' : item.message.content}
          </span>
          <span
            className={classNames(styles['number-wrapper'], {
              [styles['number-hidden']]: item.notReadNumber === 0,
            })}
          >
            <span className={styles.number}>{item.notReadNumber}</span>
          </span>
        </div>
      </div>
    </div>
  </SwipeAction>
}
