import { Button, Dialog, Popup, Toast } from 'antd-mobile'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import styles from './style.module.scss'
import { userStore } from '@/store/userStore'
import { ReactComponent as IconHome } from '@/assests/imgs/home.svg'
import { ReactComponent as IconUser } from '@/assests/imgs/user.svg'
import { logoutAccount, SUCCESS } from '@/service/user.service'

function PopAvatar() {
  const [visible, setVisible] = useState(false)
  const { avatar, account, focuses, followers, nickname } = userStore.user
  const navigate = useNavigate()

  const logout = useCallback(async () => {
    const result = await Dialog.confirm({ content: '确认退出登录？' })
    if (result) {
      const { code, message } = await logoutAccount()
      if (code === SUCCESS) {
        navigate('/login')
        Toast.show('退出登录成功')
      } else {
        Toast.show(message)
      }
    }
  }, [navigate])

  return (
    <React.Fragment>
      <div className={styles.avatar}>
        <img
          src={avatar}
          alt=""
          onClick={() => {
            setVisible(true)
          }}
        />
      </div>
      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false)
        }}
        position="left"
        bodyStyle={{ width: '70vw' }}
      >
        <div className={styles.popUp}>
          <div className={styles.inner}>
            <div className={styles.top}>
              <div className={styles.popAvatar} onClick={() => navigate(`/user/${account}`)}>
                <img src={avatar} alt="" />
              </div>
              <div className={styles.nickName}>{nickname}</div>
              <div className={styles.account}>@{account}</div>
              <div className={styles.focus} onClick={() => navigate(`/focus/${account}`)}>
                <div className={styles.count}>{focuses}</div>
                <div className={styles.text}>正在关注</div>
                <div className={styles.count}>{followers}</div>
                <div className={styles.text}>关注者</div>
              </div>
              <div className={styles.navList}>
                <div className={styles.navItem}>
                  <IconHome />
                  <div
                    className={styles.text}
                    onClick={() => {
                      navigate(`/user/${account}`)
                    }}
                  >
                    个人主页
                  </div>
                </div>
                <div className={styles.navItem}>
                  <IconUser />
                  <div
                    className={styles.text}
                    onClick={() => {
                      navigate('/revise')
                    }}
                  >
                    个人资料
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.exit}>
              <Button onClick={logout} size="small" className={styles.btn}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </Popup>
    </React.Fragment>
  )
}
export default observer(PopAvatar)
