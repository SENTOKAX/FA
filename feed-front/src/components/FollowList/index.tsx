import React from 'react'
import { ErrorBlock, InfiniteScroll } from 'antd-mobile'
import classNames from 'classnames'

import styles from './style.module.scss'
import useUserList from '@/hooks/useUserList'
import FollowItem from '@/components/FollowList/FollowItem'
import InfiniteScrollContent from '@/components/InfiniteScrollContent'
import UserSkeleton from '../UserSkeleton'
import Error from '@/components/Error'

type Props = {
  filter?: {
    keyword?: string,
    uid?: string,
    follow?: number
  }
  emptyClassName?: string
}

export default function FollowList({ filter, emptyClassName }: Props) {
  const { loading, error, users, hasNext, loadUsers, loadMoreUsers, onClickChangeFollow, ref } = useUserList(filter)

  return (<React.Fragment>
    {
      loading ?
        (<div className={styles.skeleton}>
          <span className={styles.viewDom} ref={ref} />
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </div>)
        : users.length === 0 && error ?
          <Error title={error} fresh={() => loadUsers(filter)} />
          :
          (<div className={styles.list}>
            <span className={styles.viewDom} ref={ref} />
            {
              users.map(user => <FollowItem onClickChangeFocusStatus={(follow => onClickChangeFollow(user._id, follow))} key={user._id} follow={user} />)
            }
            {
              users.length === 0 ?
                <div className={classNames(styles.empty, emptyClassName)}>
                  <ErrorBlock status='empty' />
                </div>
                :
                (<InfiniteScroll hasMore={hasNext} loadMore={loadMoreUsers}>
                  {(hasMore: boolean, failed: boolean, retry: () => void) => {
                    return <InfiniteScrollContent hasMore={hasMore} failed={failed} retry={retry} />
                  }}
                </InfiniteScroll>)
            }
          </div>)
    }
  </React.Fragment>
  )
}
