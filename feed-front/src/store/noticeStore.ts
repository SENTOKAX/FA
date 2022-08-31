import { makeAutoObservable } from 'mobx'

import { INotice } from '@/libs/types'

class NoticeStore {
  notices: INotice[] = []
  hasNext=false
  loading = true
  error = ''
  unRead=0
  constructor() {
    makeAutoObservable(this)
  }
  setNotice = (notices: INotice[]) => {
    this.notices = notices
  }
  setUnRead = (unRead:number) => {
    this.unRead= unRead
  }
  setHasNext = (hasNext:boolean) => {
    this.hasNext = hasNext
  }
  setLoading = (loading : boolean) => {
    this.loading = loading
  }
  setError = (error : string) => {
    this.error = error
  }
}

const noticeStore = new NoticeStore()
export { noticeStore }
