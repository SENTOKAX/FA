import React from 'react'

import styles from './style.module.scss'
import { ReactComponent as IconFav } from '@/assests/imgs/favicon.svg'
import { ReactComponent as IconWeixin } from '@/assests/imgs/weixin.svg'

export default function Login() {

  const login = () => {
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxa497afb6fce11bb1&redirect_uri=${encodeURIComponent('http://127.0.0.1:3000/api/user/wxlogin')}&response_type=code&scope=snsapi_userinfo#wechat_redirect`
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}><IconFav /></div>
      <div className={styles.btn_wrap}>
        <button
          className={styles.btn}
          onClick={login}
        >
          <div>
            <IconWeixin />
          </div>
          <span>微信授权登录</span>
        </button>
      </div>
    </div>
  )
}
