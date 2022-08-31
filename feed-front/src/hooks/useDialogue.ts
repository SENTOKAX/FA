import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { deleteMessageItem, getDialogueList, sendOneMessage, SUCCESS, } from '@/service/message.service'
import { DefaultUser, IMessage, IMessageType, IUser, SendStatus } from '@/libs/types'
import { useRequest } from 'ahooks'
import { Dialog, Toast } from 'antd-mobile'
import { nanoid } from 'nanoid'
import { userStore } from '@/store/userStore'
import request from '@/service/request'

type TempSender = {
  id: string
  msg: IMessage
}

export default function useDialogue(initAccount: string, scrollDom: any) {
  const [account] = useState(initAccount)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState(0)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [user, setUser] = useState<IUser>()
  const [hasNext, setHasNext] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [hasUploadList, setHasUploadList] = useState<string[]>([])
  const [hasSendList, setHasSendList] = useState<TempSender[]>([])
  const [hasFailedList, setHasFailedList] = useState<string[]>([])
  const [historyError, setHistoryError] = useState('')

  const [scrollNum, setScrollNum] = useState(0)
  const scrollToBottom = useCallback(() => {
    const currentScroll = scrollDom.current?.scrollTop || 0
    const clientHeight = scrollDom.current?.offsetHeight || 0
    const scrollHeight = scrollDom.current?.scrollHeight || 0
    if (scrollHeight > currentScroll + clientHeight) {
      scrollDom.current?.scrollTo(
        0,
        currentScroll + (scrollHeight - currentScroll - clientHeight) / 2
      )
    }
  }, [scrollDom])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [scrollNum, scrollToBottom])

  const loadInfo = useCallback(async () => {
    try {
      setError('')
      setErrorCode(0)
      const { code, data, message } = await getDialogueList(account)
      if (code === SUCCESS) {
        setMessages(data.items)
        setUser(data.user)
        setHasNext(data.hasNext)
        if (sessionTime === 0) setSessionTime(data.sessionTime)
      } else {
        Toast.show(message)
        setErrorCode(code)
        setError(message)
      }
    } catch (error: any) {
      setError(error.message)
      setErrorCode(500)
    }
  }, [account, sessionTime])

  const loadHistoryMessage = useCallback(async () => {
    try {
      setHistoryError('')
      const { code, data, message } = await getDialogueList(
        account,
        messages.length >= 1
          ? {
            next: messages[messages.length - 1]._id,
          }
          : {}
      )
      if (code === SUCCESS) {
        setMessages(messages.concat(data.items))
        setHasNext(data.hasNext)
        if (!user) setUser(data.user)
        if (sessionTime === 0) setSessionTime(data.sessionTime)
      }else {
        setHistoryError(message)
      }
    }catch (error : any) {
      Toast.show(error.message)
      setHistoryError(error.message)
    }
  }, [account, messages, sessionTime, user])

  const loadNewestMessage = async () => {
    let prev = undefined
    for (const message of messages) {
      if (message._id.length !== 8) {
        prev = message._id
        break
      }
    }
    const { code, data } = await getDialogueList(
      account,
      prev
        ? {
          prev,
        }
        : {}
    )
    if (code === SUCCESS) {
      let copyMessages : IMessage[] = JSON.parse(JSON.stringify(messages))
      if (hasUploadList.length !== 0) {
        const failed = await dealUploaded(hasUploadList)
        setHasUploadList(failed)
      }
      await clearStatus()
      for (const item of data.items) {
        copyMessages = copyMessages.filter(copy => copy._id !== item._id)
      }
      setMessages(data.items.concat(copyMessages))
      if (sessionTime === 0) setSessionTime(data.sessionTime)
    }
  }

  const { run, cancel } = useRequest(loadNewestMessage, {
    pollingInterval: 3000,
    manual: true,
    pollingWhenHidden: false,
  })

  const resendFailMessage = async (message: IMessage) => {
    const result = await Dialog.confirm({
      content: '是否重新发送',
    })
    if (!result) return
    if (message.status !== SendStatus.Fail) {
      Toast.show('重发失败')
      return
    }
    if (message.type === IMessageType.Text) {
      messages.splice(messages.indexOf(message), 1)
      sendMessage({
        content: message.content,
      })
    } else if (message.type === IMessageType.Image) {
      messages.splice(messages.indexOf(message), 1)
      if (message.file) {
        sendImage(message.file, message.content || '')
      } else {
        sendMessage({
          image: message.content,
        })
      }
    }
  }

  const sendMessage = async (msg: { content?: string; image?: string }) => {
    const tempId = nanoid(8)
    const newMessage: IMessage = {
      _id: tempId,
      fromUser: userStore.user._id,
      toUser: user?._id || '',
      isRead: false,
      content: msg.content || msg.image,
      type: msg.content ? IMessageType.Text : IMessageType.Image,
      fromDeleted: false,
      toDeleted: false,
      createAt: new Date().getTime(),
      user: user || DefaultUser,
      status: SendStatus.Sending,
      clientId: tempId
    }
    setMessages([newMessage].concat(messages))
    sendOneMessage({
      sendTo: user?._id || '',
      ...msg
    })
      .then(async (data) => {
        if (data.code === SUCCESS) {
          setHasSendList(
            hasSendList.concat([
              {
                msg: data.data,
                id: tempId,
              },
            ])
          )
        } else {
          hasFailedList.push(tempId)
        }
      })
      .catch(() => {
        hasFailedList.push(tempId)
      })
    setScrollNum(scrollNum + 1)
  }

  const uploadImagesAndSendToServer = useCallback(
    async (file: File, tempId: string) => {
      const { data } = await request.get(`/oss/upload?filename=${file.name}`)
      if (data.code === SUCCESS) {
        const ossParams = data.data
        ossParams.file = file
        const { status } = await request.post(ossParams.host, ossParams, {
          headers: {
            'Content-type': 'multipart/form-data',
          },
        })
        if (status === 200) {
          setHasUploadList(hasUploadList.concat([tempId]))
          const { code, data: messageBackData } = await sendOneMessage({
            sendTo: user?._id || '',
            image: data.data.url,
          })
          if (code === SUCCESS) {
            messageBackData.content = data.data.processUrl
            messageBackData.originImage = data.data.url
            setHasSendList(
              hasSendList.concat([
                {
                  id: tempId,
                  msg: messageBackData,
                },
              ])
            )
          } else {
            throw Error('发送失败')
          }
        } else {
          throw Error('上传失败')
        }
      }
    },
    [hasSendList, hasUploadList, user?._id]
  )

  const sendImage = useCallback(
    (file: File, tempUrl: string) => {
      const tempId = nanoid(8)
      const newMessage: IMessage = {
        _id: tempId,
        fromUser: userStore.user._id,
        toUser: user?._id || '',
        isRead: false,
        content: tempUrl,
        file,
        type: IMessageType.Image,
        fromDeleted: false,
        toDeleted: false,
        createAt: new Date().getTime(),
        user: user || DefaultUser,
        status: SendStatus.Uploading,
      }
      setMessages([newMessage].concat(messages))
      uploadImagesAndSendToServer(file, tempId).catch(() => {
        hasFailedList.push(tempId)
      })
      setScrollNum(scrollNum + 1)
    },
    [hasFailedList, messages, scrollNum, uploadImagesAndSendToServer, user]
  )

  const deleteMessage = useCallback(
    async (id: string) => {
      const { code, message } = await deleteMessageItem({
        ids: id,
      })
      if (code === SUCCESS) {
        setMessages(messages.filter((item) => item._id !== id))
      } else {
        Toast.show(message)
      }
    },
    [messages]
  )

  const dealSuccess = async (list: TempSender[]) => {
    let tempMessages: IMessage[] = JSON.parse(JSON.stringify(messages))
    const failed = []
    for (const item of list) {
      let hit = false
      tempMessages = tempMessages.filter(temp => {
        if (temp._id === item.msg._id){
          hit = true
          return false
        }
        return true
      })
      if (!hit){
        tempMessages = tempMessages.map((it) => {
          if (item.id === it._id && it.status === SendStatus.Sending) {
            hit = true
            if (it.type === IMessageType.Image) {
              item.msg.content = it.content
              return item.msg
            }
            return item.msg
          }
          return it
        })
      }
      if (!hit) failed.push(item)
    }
    setMessages(tempMessages)
    return failed
  }

  const dealFailed = async (list: string[]) => {
    let tempMessages: IMessage[] = [...messages]
    const failed = []
    for (const item of list) {
      let hit = false
      tempMessages = tempMessages.map((it) => {
        if (
          item === it._id &&
          (it.status === SendStatus.Sending || it.status === SendStatus.Uploading)
        ) {
          hit = true
          it.status = SendStatus.Fail
        } else {
          hasFailedList.splice(hasFailedList.indexOf(item), 1)
        }
        return it
      })
      if (!hit) failed.push(item)
    }
    setMessages(tempMessages)
    return failed
  }

  const dealUploaded = async (list: string[]) => {
    let tempMessages: IMessage[] = JSON.parse(JSON.stringify(messages))
    const failed = []
    for (const item of list) {
      let hit = false
      tempMessages = tempMessages.map((it) => {
        if (item === it._id) {
          hit = true
          it.file = undefined
          it.status = SendStatus.Sending
        }
        return it
      })
      if (!hit) failed.push(item)
    }
    setMessages(tempMessages)
    return failed
  }

  const clearStatus = async () => {
    if (hasUploadList.length !== 0) {
      const failed = await dealUploaded(hasUploadList)
      setHasUploadList(failed)
    }
    if (hasSendList.length !== 0) {
      const failed = await dealSuccess(hasSendList)
      setHasSendList(failed)
    }
    if (hasFailedList.length !== 0) {
      const failed = await dealFailed(hasFailedList)
      setHasFailedList(failed)
    }
  }

  useEffect(() => {
    const clearQueue = setInterval(clearStatus, 100)
    return () => {
      clearInterval(clearQueue)
    }
  })

  return {
    loadHistoryMessage,
    messages,
    user,
    error,
    hasNext,
    sendMessage,
    loadInfo,
    run,
    cancel,
    deleteMessage,
    sessionTime,
    scrollNum,
    scrollToBottom,
    sendImage,
    resendFailMessage,
    errorCode,
    historyError
  }
}
