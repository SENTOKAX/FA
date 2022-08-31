import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, ErrorBlock, InfiniteScroll, PullToRefresh } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { useScroll } from 'ahooks'

import PopAvatar from '@/components/PopAvatar'
import { ReactComponent as IconFav } from '@/assests/imgs/favicon.svg'
import { ReactComponent as IconNotice } from '@/assests/imgs/notice.svg'
import styles from './style.module.scss'
import PopCreate from '@/components/PopCreate'
import { postStore } from '@/store/postStore'
import usePost from '@/hooks/usePost'
import PostItem from '@/components/PostList/PostItem'
import UpPage from '@/components/UpPage'
import { noticeStore } from '@/store/noticeStore'
import PostSkeleton from '@/components/PostSkeleton'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import Error from '@/components/Error'

function Home() {
  const [height, setHeight] = useState(0)
  const pageView = useRef<HTMLDivElement | null>(null)
  const scroll = useScroll(pageView) 
  const { getPostList, loadMore, hasNext, likePost } = usePost()
  const { posts, error, loading, setPosition, position,first } = postStore
  const { unRead } = noticeStore

  useLayoutEffect(() => {
    pageView.current?.scroll(position)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (!error && posts.length !== 0) setPosition(scroll|| { left: 0, top: 0 })
    }
  }, [error, posts.length, scroll, setPosition])

  useEffect(() => {
    if (posts.length === 0) getPostList().then()
  }, [getPostList, posts.length])

  const renderList = useMemo(() => {
    return posts.map((post) => {
      return (
        <PostItem
          key={post._id}
          post={post}
          onClickLike={(like: boolean) => likePost(post._id, like)}
        />
      )
    })
  }, [likePost, posts])
  const navigate = useNavigate()

  const renderContent = useMemo(() => {
    if (first&&loading && posts.length === 0)
    
      return (
        <div className={styles.skeleton}>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )
    if (posts.length === 0 && error) return<div className={styles.error}> <Error title={error} fresh={getPostList} /></div>
    return (
      <div
        className={styles.list}
        ref={pageView}
        onScroll={() => {
          setHeight(pageView.current?.scrollTop as number)
        }}
      >
        <PullToRefresh onRefresh={getPostList}>
          {posts.length > 0 ? (
            <>
              {renderList}
              <InfiniteScroll loadMore={loadMore} hasMore={hasNext}>
                {(hasMore: boolean, failed: boolean, retry: () => void) => {
                  return <InfiniteScrollContent hasMore={hasMore} failed={failed} retry={retry} />
                }}
              </InfiniteScroll>
            </>
          ) : (
            <div className={styles.empty}>
              <ErrorBlock status="empty" title="暂无帖子" description="下拉刷新试试" />
            </div>
          )}
        </PullToRefresh>
      </div>
    )
  }, [error, first, getPostList, hasNext, loadMore, loading, posts.length, renderList])

  return (
    <React.Fragment>
      <div className={styles.home}>
        <div className={styles.header}>
          <div className={styles.inner}>
            <PopAvatar />
            <div className={styles.icon}>
              <IconFav />
            </div>
            <Badge
              content={unRead === 0 ? null : unRead > 99 ? '99+' : unRead}
              style={{ '--right': unRead > 99 ? '-6px' : '-5px' }}
            >
              <div
                className={styles.notice}
                onClick={() => {
                  navigate('/notice')
                }}
              >
                <IconNotice />
              </div>
            </Badge>
          </div>
        </div>
        {renderContent}
      </div>
      <PopCreate />
      <UpPage height={height} pageView={{ current: pageView.current }} />
    </React.Fragment>
  )
}

export default observer(Home)
