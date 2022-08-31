import { useCallback } from 'react'
import { Toast } from 'antd-mobile'
import { useRequest } from 'ahooks'

import { messageListStore } from '@/store/messageListStore'
import { deleteMessageSessionItem, getMessageList, SUCCESS } from '@/service/message.service'

export function useMessage() {
  const { setHasNext, messages, setMessages, setUnRead, loading, setLoading } = messageListStore

  const loadInfo = useCallback(async () => {
    try {
      setLoading(true)
      const { code, message, data } = await getMessageList()
      if (code === SUCCESS) {
        setMessages(data.list)
        setHasNext(data.hasNext)
        setUnRead(data.unRead)
      } else {
        Toast.show(message)
      }
    } catch (error: any) {
      Toast.show(error.message)
    } finally {
      setLoading(false)
    }
  }, [setHasNext, setLoading, setMessages, setUnRead])

  const loadMoreMessage = useCallback(async () => {
    try {
      const { code, message, data } = await getMessageList(
        messages.length >= 1
          ? {
            next: messages[messages.length - 1].message.createAt,
          }
          : {}
      )
      if (code === SUCCESS) {
        setMessages(messages.concat(data.list))
        setHasNext(data.hasNext)
        setUnRead(data.unRead)
      } else {
        Toast.show(message)
      }
    } catch (error: any) {
      Toast.show(error.message)
      throw error
    }
  }, [messages, setHasNext, setMessages, setUnRead])

  const loadNewestMessage = useCallback(async () => {
    const { code, data } = await getMessageList(
      messages.length >= 1
        ? {
          prev: messages[0].message.createAt,
        }
        : {}
    )
    if (code === SUCCESS) {
      let copyMessages = [...messages]
      for (const item of [...data.list]) {
        copyMessages = copyMessages.filter((msg) => msg.user._id !== item.user._id)
      }
      setMessages(data.list.concat(copyMessages))
      setUnRead(data.unRead)
    }
  }, [messages, setMessages, setUnRead])

  const { run, cancel } = useRequest(loadNewestMessage, {
    pollingInterval: 3000,
    manual: true,
  })

  const clearMessageWatch = useCallback(
    (id: string) => {
      setMessages(
        messages.map((message) => {
          if (message._id === id) message.notReadNumber = 0
          return message
        })
      )
    },
    [messages, setMessages]
  )

  const deleteMessageSession = useCallback(
    async (id: string) => {
      const { code, message } = await deleteMessageSessionItem(id)
      if (code === SUCCESS) {
        setMessages(messages.filter((item) => item._id !== id))
      } else {
        Toast.show(message)
      }
    },
    [messages, setMessages]
  )

  return {
    loadMoreMessage,
    loadNewestMessage,
    loadInfo,
    run,
    cancel,
    clearMessageWatch,
    deleteMessageSession,
    loading,
  }
}
