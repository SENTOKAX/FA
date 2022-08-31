import { Toast } from 'antd-mobile'
import { action, makeAutoObservable, runInAction } from 'mobx'

import { IUser, UserStatus } from '@/libs/types'
import { info, modifyInfo, SUCCESS } from '@/service/user.service'
class UserStore {
  user: IUser = {
    account: '',
    avatar: '',
    banner: '',
    createAt: 0,
    focuses: 0,
    followers: 0,
    bio: '',
    nickname: '',
    _id: '',
    type: UserStatus.Normal
  }
  constructor() {
    makeAutoObservable(this)
    this.freshUserInfo().then()
  }

  @action
  async freshUserInfo(){
    const res = await info()
    if (res.data.code === SUCCESS) {
      runInAction(() => {
        this.user = res.data.data
      })
      return res.data.data
    }
  }

  @action
  async modifyUserInfo(info: {avatar?: string, banner?: string, bio?: string, nickname?: string}){
    const { data, message, code } = await modifyInfo(info)
    if (code === SUCCESS){
      runInAction(()=> {
        this.user = data
      })
      Toast.show('修改成功')
      return true
    }
    Toast.show(message)
    return false
  }
}

const userStore = new UserStore()
export { userStore }
