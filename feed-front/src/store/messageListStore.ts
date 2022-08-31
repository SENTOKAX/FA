import { makeAutoObservable } from 'mobx'

import { IMessageSession } from '@/libs/types'

class MessageListStore {
  messages: IMessageSession[] = []
  hasNext = false
  unRead = 0
  loading = true

  constructor() {
    makeAutoObservable(this)
  }

  setMessages = (messages: IMessageSession[]) => {
    this.messages = messages
  }
  setUnRead = (unRead: number) => {
    this.unRead = unRead
  }
  setHasNext = (hasNext: boolean) => {
    this.hasNext = hasNext
  }
  setLoading = (loading : boolean) => {
    this.loading = loading
  }
}

const messageListStore = new MessageListStore()
export { messageListStore }
