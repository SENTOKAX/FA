import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { Button, Form, Input, Toast } from 'antd-mobile'

import styles from './style.module.scss'
import { userStore } from '@/store/userStore'
import { register, SUCCESS } from '@/service/user.service'
import { UserStatus } from '@/libs/types'
import { ReactComponent as IconFav } from '@/assests/imgs/favicon.svg'

function Register() {
  const navigate = useNavigate()

  const onFinish = async (values: { account: string }) => {
    const id = userStore.user._id
    const { account } = values
    if (id) {
      const { code, message } = await register(id, account)
      if (code === SUCCESS) {
        Toast.show('注册成功')
        await userStore.freshUserInfo()
        navigate('/')
      } else {
        Toast.show(message)
      }
    }
  }

  useEffect(() => {
    userStore.freshUserInfo().then((res) => {
      if (res.status !== UserStatus.Registering) {
        navigate('/')
      }
    })
  }, [navigate])

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <IconFav />
      </div>
      <div className={styles.info}>
        <div className={styles.avatar}>
          <img src={userStore.user.avatar} alt="" />
        </div>
        <div className={styles.name}>{userStore.user.nickname}</div>
        <Form
          layout="horizontal"
          mode="card"
          onFinish={onFinish}
          footer={
            <Button type="submit" color="primary" size="middle" className={styles.btn}>
              注册
            </Button>
          }
        >
          <Form.Item name="account" style={{ paddingLeft: '0', marginBottom: '-12px' }} rules={[
            { required: true, message: '请输入用户名' },
            { min: 4, message: '用户名长度4-18位' },
            { max: 18, message: '用户名长度4-18位' },
            { pattern: new RegExp('^[a-zA-Z0-9]*$'), message: '用户名必须为字母和数字' }
          ]}>
            <div className={styles.input}>
              <span className={styles.prefix}>@</span>
              <Input placeholder="请输入用户名" className={styles.accountInput}/>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
export default observer(Register)
