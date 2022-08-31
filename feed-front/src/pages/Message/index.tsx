import React, { useMemo } from 'react'
import { ErrorBlock, InfiniteScroll, PullToRefresh } from 'antd-mobile'
import { observer } from 'mobx-react-lite'

import styles from './style.module.scss'
import PopAvatar from '@/components/PopAvatar'
import { useMessage } from '@/hooks/useMessage'
import { messageListStore } from '@/store/messageListStore'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import MessageItem from '@/pages/Message/MessageItem'
import UserSkeleton from '@/components/UserSkeleton'

function Message() {
  const { loadMoreMessage, loadNewestMessage, clearMessageWatch, deleteMessageSession, loading } = useMessage()
  const { hasNext, messages } = messageListStore
  const messagesList = useMemo(() => {
    return messages.map((item) => <MessageItem
      clearMessageWatch={()=> clearMessageWatch(item._id)}
      deleteMessageSession={()=> deleteMessageSession(item._id)}
      key={item._id}
      item={item} />)
  }, [clearMessageWatch, deleteMessageSession, messages])

  const renderContent = useMemo(()=>{
    if (loading && messages.length === 0){
      return <>
        <UserSkeleton />
        <UserSkeleton />
        <UserSkeleton />
      </>
    }
    if (messages.length === 0){
      return <PullToRefresh refreshingText="正在加载" onRefresh={loadNewestMessage}>
        <div className={styles.empty}>
          <ErrorBlock status='empty' title='暂无私信' description='' />
        </div>
      </PullToRefresh>
    }
    return <PullToRefresh refreshingText="正在加载" onRefresh={loadNewestMessage}>
      <div className={styles.list}>{messagesList}</div>
      <InfiniteScroll hasMore={hasNext} loadMore={loadMoreMessage}>
        {(hasMore: boolean, failed: boolean, retry: () => void)=>{
          return <InfiniteScrollContent noneEnd hasMore={hasMore} failed={failed} retry={retry} />
        }}
      </InfiniteScroll>
    </PullToRefresh>
  }, [hasNext, loadMoreMessage, loadNewestMessage, loading, messages.length, messagesList])

  return (
    <div className={styles.message}>
      <div className={styles.header}>
        <div className={styles.inner}>
          <PopAvatar />
          <div className={styles.title}>私信</div>
        </div>
      </div>
      {renderContent}
    </div>
  )
}

export default observer(Message)
