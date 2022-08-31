import { makeAutoObservable } from 'mobx'

import { IPost, Position } from '@/libs/types'

class PostStore {
  posts: IPost[] = []
  lastRequestId = ''
  first=true
  hasNext = false
  hasNew = false
  loading = true
  error = ''
  position : Position = {
    left: 0,
    top: 0
  }

  constructor() {
    makeAutoObservable(this)
  }

  setPost = (posts: IPost[]) => {
    this.posts = posts
  }
  setHasNext = (hasNext: boolean) => {
    this.hasNext = hasNext
  }
  setHasNew = (hasNew: boolean) => {
    this.hasNew = hasNew
  }
  setLastRequestId = (lastRequestId: string) => {
    this.lastRequestId = lastRequestId
  }
  setLoading = (loading : boolean) => {
    this.loading = loading
  }
  setFirst = (first : boolean) => {
    this.first = first
  }
  setError = (error : string) => {
    this.error = error
  }
  setPosition = (position : Position) => {
    this.position = position
  }
}

const postStore = new PostStore()
export { postStore }
