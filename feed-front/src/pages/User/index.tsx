import { PullToRefresh, Swiper, Tabs, Toast } from 'antd-mobile'
import { SwiperRef } from 'antd-mobile/es/components/swiper'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'

import styles from './style.module.scss'
import UserHeader from './UserHeader'
import { FollowStatus, IUser, UserStatus } from '@/libs/types'
import PopCreate from '@/components/PopCreate'
import { getUserInfo, SUCCESS } from '@/service/user.service'
import { changeFocusStatus } from '@/service/focus.service'
import UpPage from '@/components/UpPage'
import PostList from '@/components/PostList'
import Error from '@/components/Error'

function User() {
  const params = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [errorStatus, setErrorStatus] = useState(0)
  const [user, setUser] = useState<IUser>({
    account: '',
    avatar: '',
    banner: '',
    createAt: 0,
    focuses: 0,
    followers: 0,
    bio: '',
    nickname: '',
    _id: '',
    type: UserStatus.Normal,
  })
  const swiperRef = useRef<SwiperRef>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const getInfo = useCallback(async () => {
    try {
      setError('')
      setErrorStatus(0)
      const res = await getUserInfo(params.account)
      if (res.code === SUCCESS) {
        setUser(res.data)
      } else {
        setError(res.message)
        setErrorStatus(res.code)
      }
    } catch (error: any) {
      setError(error.message)
      setErrorStatus(500)
    }
  }, [params.account, setError])

  const changeFollowStatus = useCallback(async () => {
    let focus = false
    if (
      user?.focusStatus &&
      [FollowStatus.HasBeFollowed, FollowStatus.NoFollow].includes(user.focusStatus)
    ) {
      focus = true
    } else if (user.focusStatus === FollowStatus.Self) {
      return
    }
    const { code, message, data } = await changeFocusStatus(user._id, focus)
    if (code === SUCCESS) {
      setUser(Object.assign({}, user, { focusStatus: data.focusStatus }))
    } else {
      Toast.show(message)
    }
  }, [user])

  const [height, setHeight] = useState(0)
  const pageView = useRef<HTMLDivElement | null>(null)
  const tabRef = useRef<HTMLDivElement | null>(null)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    setLock((tabRef.current?.getBoundingClientRect().y || 0) > 2)
  }, [])

  const tabItems = useMemo(
    () => [
      { key: 'posts', title: '帖子' },
      { key: 'photos', title: '照片' },
      { key: 'likes', title: '喜欢' },
    ],
    []
  )

  useEffect(() => {
    getInfo().then()
  }, [getInfo])

  const postScroll = useRef<HTMLDivElement | null>(null)
  const imageScroll = useRef<HTMLDivElement | null>(null)
  const likeScroll = useRef<HTMLDivElement | null>(null)

  const currentList = useMemo(() => {
    const ref = activeIndex === 0 ? postScroll : activeIndex === 1 ? imageScroll : likeScroll
    setHeight(ref.current?.scrollTop as number)
    return ref
  }, [activeIndex])

  const [postRefreshTick, setPostRefreshTick] = useState(1)
  const postListMemo = useMemo(() => postRefreshTick && <PostList emptyClassName={styles.empty} filter={{ account: params.account }} />, [params.account, postRefreshTick])

  const postList = useMemo(
    () => <div
      style={{ overflow: lock ? 'hidden' : 'auto' }}
      className={styles.scroll}
      onScroll={() => setHeight(postScroll.current?.scrollTop as number)}
      ref={postScroll}
    >
      {postListMemo}
    </div>,
    [lock, postListMemo]
  )

  const [imageRefreshTick, setImageRefreshTick] = useState(1)
  const imageListMemo = useMemo(() => imageRefreshTick && <PostList  emptyClassName={styles.empty} filter={{ image: true, account: params.account }} />, [imageRefreshTick, params.account])

  const imageList = useMemo(
    () => <div
      style={{ overflow: lock ? 'hidden' : 'auto' }}
      className={styles.scroll}
      onScroll={() => setHeight(imageScroll.current?.scrollTop as number)}
      ref={imageScroll}
    >
      {imageListMemo}
    </div>,
    [imageListMemo, lock]
  )

  const [likeRefreshTick, setLikeRefreshTick] = useState(1)
  const likeListMemo = useMemo(() => likeRefreshTick && <PostList emptyClassName={styles.empty} filter={{ like: true, likeFor: params.account }} />, [likeRefreshTick, params.account])

  const likeList = useMemo(
    () => <div
      style={{ overflow: lock ? 'hidden' : 'auto' }}
      className={styles.scroll}
      onScroll={() => setHeight(likeScroll.current?.scrollTop as number)}
      ref={likeScroll}
    >
      {likeListMemo}
    </div>,
    [likeListMemo, lock]
  )

  const renderContent = useMemo(() => {
    if (error) return <Error title={error} button={<span onClick={() => {
      if (errorStatus === 1006) {
        return navigate('/')
      }
      return getInfo()
    }} className={styles['error-fresh']}>{errorStatus === 1006 ? '返回首页' : '刷新'}</span>} />
    return (
      <>
        <UserHeader user={user} onFocus={changeFollowStatus} />
        <div ref={tabRef}>
          <Tabs
            className={styles.tabs}
            activeLineMode="fixed"
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
        </div>
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
          <Swiper.Item>
            {postList}
          </Swiper.Item>
          <Swiper.Item>
            {imageList}
          </Swiper.Item>
          <Swiper.Item>
            {likeList}
          </Swiper.Item>
        </Swiper>
      </>
    )
  }, [activeIndex, changeFollowStatus, error, errorStatus, getInfo, imageList, likeList, navigate, postList, tabItems, user])

  return (
    <React.Fragment>
      <div
        className={styles.user}
        ref={pageView}
        onScroll={() => {
          setLock((tabRef.current?.getBoundingClientRect().y || 0) > 2)
        }}
      >
        <PullToRefresh completeText='加载中' onRefresh={async ()=>{
          if (activeIndex === 0) setPostRefreshTick(postRefreshTick + 1)
          else if (activeIndex === 1) setImageRefreshTick(imageRefreshTick + 1)
          else if (activeIndex === 2) setLikeRefreshTick(likeRefreshTick + 1)
        }}>
          {renderContent}
          <PopCreate />
          <UpPage height={height} pageView={{ current: currentList.current }} />
        </PullToRefresh>
      </div>
    </React.Fragment>
  )
}
export default observer(User)
