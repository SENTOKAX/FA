import React from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { Action } from 'antd-mobile/es/components/swipe-action'

import styles from './style.module.scss'
import { INotice } from '@/libs/types'
import { SwipeAction } from 'antd-mobile'

interface IProps {
  notify: INotice
  noticeList: () => void
  deleteNotice: () => void
  readNotice: () => void
}

export default function ListItem(props: IProps) {
  const { content, createAt, isRead, type, relationId } = props.notify
  const { avatar, nickname, account } = props.notify.user
  const navigate = useNavigate()
  const rightActions: Action[] = isRead ? [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => {
        props.deleteNotice()

      },
    },
  ] : [
    {
      key: 'readed',
      text: '设为已读',
      color: 'warning',
      onClick: () => {
        props.readNotice()

      },
    },
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => {
        props.deleteNotice()

      },
    },
  ]
  return (
    <SwipeAction rightActions={rightActions}>
      <div className={styles.item}>
        <div className={styles.left}>
          <div className={styles.avatar} onClick={() => { navigate(`/user/${account}`) }}>
            <img src={avatar} alt="" />
          </div>
          <div className={styles.info} onClick={() => {
            props.readNotice()
            navigate(type === 1 ? `/user/${account}` : `/post/${relationId}`)
          }}>
            <div className={styles.text}>
              <div className={styles.name} >{nickname}</div>
              <div className={styles.details}> {content}</div>
            </div>
            <div className={styles.time}>{dayjs(createAt).format('YYYY/MM/DD HH:mm')}</div>
          </div>
        </div>
        {isRead ? null : <div className={styles.new}></div>}
      </div>
    </SwipeAction >
  )
}
