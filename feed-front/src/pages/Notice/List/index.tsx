import React, { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { ErrorBlock, InfiniteScroll, PullToRefresh } from 'antd-mobile'

import ListItem from '../ListItem'
import styles from './style.module.scss'
import useNotice from '@/hooks/useNotice'
import { noticeStore } from '@/store/noticeStore'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import UserSkeleton from '@/components/UserSkeleton'
import Error from '@/components/Error'

function List() {
  const { noticeList, readNotice, deleteNotice, loadMore, loadNewest } = useNotice()
  const { notices, hasNext, loading, error } = noticeStore
  const renderContent = useMemo(() => {
    if (loading && notices.length === 0)
      return (
        <div className={styles.skeleton}>
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </div>
      )
    if (notices.length === 0 && error) return <div className={styles.error}><Error title={error} fresh={noticeList} /></div>
    return (
      <PullToRefresh onRefresh={loadNewest}>
        {notices.length > 0 ? (
          <>
            {notices.map((notify) => {
              return (
                <ListItem
                  key={notify._id}
                  notify={notify}
                  noticeList={() => noticeList()}
                  deleteNotice={() => {
                    deleteNotice(notify._id)
                  }}
                  readNotice={() => {
                    readNotice(notify._id)
                  }}
                />
              )
            })}
            <InfiniteScroll loadMore={loadMore} hasMore={hasNext}>
              {(hasMore: boolean, failed: boolean, retry: () => void) => {
                return <InfiniteScrollContent hasMore={hasMore} failed={failed} retry={retry} />
              }}
            </InfiniteScroll>
          </>
        ) : (
          <div className={styles.empty}><ErrorBlock status='empty' title='暂无通知' description='' /></div>

        )}
      </PullToRefresh>
    )
  }, [deleteNotice, error, hasNext, loadMore, loadNewest, loading, noticeList, notices, readNotice])
  return (
    <React.Fragment>
      <div className={styles.list}>{renderContent}</div>
    </React.Fragment>
  )
}
export default observer(List)
