import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DotLoading, Input, NavBar } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'
import ImageUploader, { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'
import { useRequest } from 'ahooks'

import styles from './style.module.scss'
import { ReactComponent as IconBack } from '@/assests/imgs/back.svg'
import useDialogue from '@/hooks/useDialogue'
import { IMessage } from '@/libs/types'
import { ReactComponent as IconImage } from '@/assests/imgs/img.svg'
import DialogueItem from '@/pages/Dialogue/DialogueItem'
import { userStore } from '@/store/userStore'
import Error from '@/components/Error'

export default function Dialogue() {
  const navigate = useNavigate()
  const params = useParams()
  const [image, setImage] = useState<ImageUploadItem[]>([])
  const scrollDom = useRef<HTMLDivElement | null>(null)
  const { loadHistoryMessage, messages, user, errorCode, error, hasNext, sendMessage, loadInfo, run, cancel, deleteMessage, sessionTime, sendImage, resendFailMessage, historyError } = useDialogue(params.account || '', scrollDom)

  const renderMessages = useMemo(() => {
    let id: string | undefined
    const reverseMessages = [...messages].reverse()
    for (let index = 0; index < reverseMessages.length; index++) {
      const message = reverseMessages[index]
      if (message.toUser !== userStore.user._id) break
      if (index === 0 && !hasNext && message.createAt > sessionTime) id = message._id
      else if (message.createAt > sessionTime && index >= 1 && reverseMessages[index - 1].createAt < sessionTime) id = message._id
    }

    return messages.map((message: IMessage) => {
      if (message._id === id) {
        return <>
          <DialogueItem resendFailMessage={() => resendFailMessage(message)} key={message._id} message={message} deleteMessage={() => deleteMessage(message._id)} />
          <span key={message._id + '_unread'} className={styles.tips}>未读</span></>
      }
      return <DialogueItem resendFailMessage={() => resendFailMessage(message)} key={message._id} message={message} deleteMessage={() => deleteMessage(message._id)} />
    })
  }, [deleteMessage, hasNext, messages, resendFailMessage, sessionTime])
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    loadInfo().then()
    setTimeout(() => run(), 3000)
    return () => {
      cancel()
    }
  }, [cancel, loadInfo, run])

  async function mockUpload(file: File) {
    const tempUrl = URL.createObjectURL(file)
    sendImage(file, tempUrl)
    return {
      url: tempUrl
    }
  }

  const { run: enterSendMessage } = useRequest(async () => {
    const msg = value.trim()
    if (!msg) return
    sendMessage({
      content: msg
    })
    setValue('')
  }, {
    throttleWait: 300,
    manual: true
  })

  if (error) {
    return <Error className={styles['error-wrapper']} title={error} button={<span onClick={() => {
      if (errorCode === 1006 || errorCode === 1601) {
        return navigate('/message')
      }
      return loadInfo()
    }} className={styles['error-fresh']}>{errorCode === 1006 || errorCode === 1601 ? '返回私信列表' : '刷新'}</span>} />
  }

  return (
    <div className={styles.dialogue}>
      <NavBar
        className={styles.nav}
        backArrow={<IconBack />}
        onBack={() => navigate(-1)}
        style={{ fontSize: '16px' }}
      >
        <span className={styles.navTitle}>{user?.nickname}</span>
      </NavBar>
      <div
        ref={scrollDom}
        id="scrollableDiv"
        className={styles.list}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={loadHistoryMessage}
          className={styles.scroll}
          inverse={true}
          hasMore={hasNext}
          loader={
            historyError ? <span className={styles['fail-container']}>
              <span className={styles.fail}>加载失败</span>
              <span className={styles.retry} onClick={loadHistoryMessage}>重新加载</span>
            </span>
              : <div className={styles.loading}><DotLoading color='primary' /></div>
          }
          scrollableTarget="scrollableDiv"
          endMessage={<span className={styles.tips}>无历史聊天记录</span>}
        >
          {renderMessages}
        </InfiniteScroll>
      </div>
      <div className={styles.sender}>
        <div className={styles.upload}>
          <ImageUploader
            value={image}
            onChange={setImage}
            upload={mockUpload}
          >
            <IconImage className={styles.image} />
          </ImageUploader>
        </div>
        <Input onEnterPress={enterSendMessage} value={value} onChange={value => setValue(value)} className={styles.input} placeholder='开始写私信' maxLength={128} />
        <span onClick={enterSendMessage} className={styles.send}>发送</span>
      </div>
    </div>
  )
}
