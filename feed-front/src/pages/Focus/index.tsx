import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavBar, Swiper, Tabs, Toast } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { SwiperRef } from 'antd-mobile/es/components/swiper'

import styles from './style.module.scss'
import { ArrowLeftOutlined } from '@ant-design/icons'
import FollowList from '@/components/FollowList'
import * as api from '@/service/user.service'
import { IFollowObjectStatus, IUser } from '@/libs/types'
import { userStore } from '@/store/userStore'

export default function Focus() {
  const params = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<IUser>()

  const getInfo = useCallback(async () => {
    const { code, message, data } = await api.getUserInfo(params.account)
    if (code === 0) {
      setUser(data)
    } else {
      Toast.show({
        icon: 'fail',
        content: message,
      })
    }
  }, [params.account])

  useEffect(() => {
    getInfo().then()
  }, [getInfo])

  useEffect(() => {
    return () => {
      userStore.freshUserInfo().then()
    }
  }, [])

  const swiperRef = useRef<SwiperRef>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const tabItems = [
    { key: 'follower', title: '关注者' },
    { key: 'following', title: '正在关注' },
  ]

  const follower = useMemo(() => {
    if (user) return <FollowList filter={{ follow: IFollowObjectStatus.Follower, uid: user._id }} />
  }, [user])
  const following = useMemo(() => {
    if (user) return <FollowList filter={{ follow: IFollowObjectStatus.Following, uid: user._id }} />
  }, [user])

  return (
    <div className={styles.wrapper}>
      <NavBar onBack={() => navigate(-1)} backArrow={<div className={styles.icon}>
        <ArrowLeftOutlined />
      </div>}>
        {user ? user.nickname : null}
      </NavBar>
      <Tabs
        activeKey={tabItems[activeIndex].key}
        onChange={(key) => {
          const index = tabItems.findIndex((item) => item.key === key)
          setActiveIndex(index)
          swiperRef.current?.swipeTo(index)
        }}
      >
        {tabItems.map((item) => (
          <Tabs.Tab title={item.title} key={item.key} />
        ))}
      </Tabs>
      <Swiper
        className={styles.wrapper}
        direction="horizontal"
        indicator={() => null}
        ref={swiperRef}
        defaultIndex={activeIndex}
        onIndexChange={(index) => {
          setActiveIndex(index)
        }}
      >
        <Swiper.Item className={styles.scroll}>
          {follower}
        </Swiper.Item>
        <Swiper.Item className={styles.scroll}>
          {following}
        </Swiper.Item>
      </Swiper>
    </div>
  )
}
