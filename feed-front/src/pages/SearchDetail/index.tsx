import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { SearchBar, Swiper, Tabs } from 'antd-mobile'
import { SwiperRef } from 'antd-mobile/es/components/swiper'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ReactComponent as IconBack } from '@/assests/imgs/back.svg'
import styles from './style.module.scss'
import PopCreate from '@/components/PopCreate'
import PostList from '@/components/PostList'
import FollowList from '@/components/FollowList'
import UpPage from '@/components/UpPage'

export default function SearchDetail() {
  const [search] = useSearchParams()
  const [keyword, setKeyword] = useState(decodeURIComponent(search.get('keyword') || ''))
  const swiperRef = useRef<SwiperRef>(null)
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo(() => {
    return [
      { key: 'posts', title: '帖子' },
      { key: 'users', title: '用户' },
      { key: 'photos', title: '图片' },
    ]
  }, [])

  const [arr, setArr] = useState<string[]>(JSON.parse(localStorage.getItem('searchArr') as string) || [])
  const hasSearch = useCallback(async (val: string) => {
    if (val !== '' && /^[\s]*$/.test(val) !== true) {
      setKeyword(val)
      const temp = JSON.parse(JSON.stringify(arr))
      temp.unshift(val)
      localStorage.setItem('searchArr', JSON.stringify(temp))
      setArr(temp)
      navigate(`/search/detail/?keyword=${encodeURIComponent(val)}`)
    }
  }, [arr, navigate])

  useEffect(() => {
    if (!keyword) {
      navigate('/search')
    }
  }, [keyword, navigate])

  const postScroll = useRef<HTMLDivElement | null>(null)
  const userScroll = useRef<HTMLDivElement | null>(null)
  const imageScroll = useRef<HTMLDivElement | null>(null)

  const postList = useMemo(() => <div onScroll={() => setHeight(postScroll.current?.scrollTop as number)} ref={postScroll} className={styles.scroll}><PostList filter={{ keyword }} /></div>, [keyword])
  const userList = useMemo(() => <div onScroll={() => setHeight(userScroll.current?.scrollTop as number)} ref={userScroll} className={styles.scroll}><FollowList filter={{ keyword }} /></div>, [keyword])
  const imageList = useMemo(() => <div onScroll={() => setHeight(imageScroll.current?.scrollTop as number)} ref={imageScroll} className={styles.scroll}><PostList filter={{ keyword, image: true }} /></div>, [keyword])
  const [height, setHeight] = useState(0)
  const currentList = useMemo(() => {
    const ref = activeIndex === 0 ? postScroll : activeIndex === 1 ? userScroll : imageScroll
    setHeight(ref.current?.scrollTop as number)
    return ref
  }, [activeIndex])

  return (
    <>
      <div className={styles.set}>
        <IconBack onClick={() => navigate('/search')} className={styles.back} />
        <SearchBar
          placeholder='搜索'
          className={styles.search}
          defaultValue={keyword}
          onSearch={(val) => hasSearch(val)}
        />
      </div>
      <Tabs className={styles.tab}
        activeLineMode="fixed"
        activeKey={items[activeIndex].key}
        onChange={(key) => {
          const index = items.findIndex((item) => item.key === key)
          setActiveIndex(index)
          swiperRef.current?.swipeTo(index)
        }}>
        {items.map((item) => (
          <Tabs.Tab title={item.title} key={item.key} />
        ))}
      </Tabs>
      <div className={styles.content}>
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
          <Swiper.Item>{postList}</Swiper.Item>
          <Swiper.Item>{userList}</Swiper.Item>
          <Swiper.Item>{imageList}</Swiper.Item>
        </Swiper>
      </div>
      <PopCreate />
      <UpPage height={height} pageView={{ current: currentList.current }} />
    </>
  )
}
