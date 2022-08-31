import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageViewer, Popover, SpinLoading } from 'antd-mobile'
import classNames from 'classnames'

import styles from './style.module.scss'
import { userStore } from '@/store/userStore'
import { IMessage, IMessageType, SendStatus } from '@/libs/types'
import { formatMessageTime } from '@/utils/time'
import useLongPress from '@/hooks/useLongPress'
import { ReactComponent as IconFail } from '@/assests/imgs/location_icon_fail.svg'

type Props = {
  message: IMessage
  deleteMessage?: () => void
  resendFailMessage: ()=> void
}

export default function DialogueItem({ message, deleteMessage, resendFailMessage }: Props) {
  const [visible, setVisible] = useState(false)
  const popover = useRef<HTMLSpanElement>(null)
  const pressRef = useRef<HTMLDivElement>(null)

  useLongPress<HTMLDivElement>({
    ref: pressRef,
    onLongTap: () => {
      setVisible(true)
    }
  })

  useEffect(() => {
    const hiddenPopOver = (event: any) => {
      if (!popover?.current?.contains(event.target)) {
        setVisible(false)
      }
    }
    if (visible) {
      document.addEventListener('touchstart', hiddenPopOver)
    }
    return () => {
      document.removeEventListener('touchstart', hiddenPopOver)
    }
  }, [visible])

  const renderContent = useMemo(() => {
    if (message.type === IMessageType.Image) {
      return <>
        <div className={styles.imageContainer}>
          {
            message.status === SendStatus.Uploading && <div className={styles.mask}>
              <SpinLoading color='currentColor'/>
              <span className={styles.tips}>上传中...</span>
            </div>
          }
          <Image onContainerClick={() => {
            ImageViewer.show({
              image: message.originImage || message.content
            })
          }} src={message.content} width={140} className={styles.image} fit='cover'/>
        </div>
      </>
    }
    return <>
      <div className={classNames(styles.content, 'unselect')}>{message.content}</div>
    </>
  }, [message.content, message.originImage, message.status, message.type])

  return <>
    <div className={classNames({
      [styles['left-wrapper']]: message.toUser === userStore.user._id,
      [styles['right-wrapper']]: message.fromUser === userStore.user._id,
    })}>
      <Popover
        destroyOnHide={true}
        content={<span ref={popover} className={styles.delete} onClick={() => {
          deleteMessage && deleteMessage()
          setVisible(false)
        }}>删除</span>}
        placement='top'
        mode='dark'
        visible={visible}
      >
        <>
          {
            message.fromUser === userStore.user._id && message.status === SendStatus.Fail && <div onClick={resendFailMessage} className={styles.fail}>
              <IconFail />
            </div>
          }
          {
            message.fromUser === userStore.user._id && message.status === SendStatus.Sending && <div className={styles.fail}>
              <SpinLoading className={styles.spin} color='primary' />
            </div>
          }
          <div
            ref={pressRef}
            className={classNames(styles.wrapper, {
              [styles['text-wrapper']]: message.type === IMessageType.Text,
              [styles['image-wrapper']]: message.type === IMessageType.Image
            })}>
            {renderContent}
            <div className={classNames(styles.time, 'unselect')}>{formatMessageTime(message.createAt)}</div>
          </div>
        </>
      </Popover>
    </div>
  </>
}
