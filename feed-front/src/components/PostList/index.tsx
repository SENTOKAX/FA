import React from 'react'
import { ErrorBlock, InfiniteScroll } from 'antd-mobile'
import classNames from 'classnames'

import styles from './style.module.scss'
import usePostList from '@/hooks/usePostList'
import PostSkeleton from '../PostSkeleton'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import Error from '@/components/Error'
import PostItem from './PostItem'

type Props = {
  filter?: {
    keyword?: string
    account?: string
    image?: boolean
    like?: boolean
    likeFor?: string
  }
  emptyClassName?: string
}

export default function PostList({ filter, emptyClassName }: Props) {
  const {
    error,
    posts,
    loading,
    hasNext,
    loadPosts,
    loadMorePosts,
    onPostClickLike,
    onPostCommentSuccess,
    onPostRepostSuccess,
    onDeleteSuccess,
    ref
  } = usePostList(filter)

  return (<React.Fragment>
    {
      loading ?
        (<div className={styles.skeleton}>
          <span className={styles.viewDom} ref={ref} />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>)
        : posts.length === 0 && error ?
          <Error title={error} fresh={() => loadPosts(filter)} />
          :
          (<div className={styles.list}>
            <span className={styles.viewDom} ref={ref} />
            {posts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onClickLike={(like: boolean) => onPostClickLike(post._id, like)}
                onCommentSuccess={() => onPostCommentSuccess(post._id)}
                onTransmitSuccess={() => onPostRepostSuccess(post._id)}
                onDeleteSuccess={() => onDeleteSuccess(post._id)}
              />
            ))}

            {
              posts.length === 0 ?
                <div className={classNames(styles.empty, emptyClassName)}>
                  <ErrorBlock status='empty' />
                </div>
                :
                (
                  <InfiniteScroll hasMore={hasNext} loadMore={loadMorePosts} >
                    {(hasMore: boolean, failed: boolean, retry: () => void) => {
                      return <InfiniteScrollContent hasMore={hasMore} failed={failed} retry={retry} />
                    }}
                  </InfiniteScroll>
                )
            }
          </div>)
    }
  </React.Fragment>
  )
}
