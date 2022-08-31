import React from 'react'
import { SpinLoading } from 'antd-mobile'

import styles from './style.module.scss'

type Props = {
  hasMore: boolean,
  failed: boolean,
  retry: () => void
  noneEnd?: boolean
}

export default function InfiniteScrollContent({ hasMore, failed, retry, noneEnd }: Props) {
  if (failed) return <span>
    <span className={styles.fail}>加载失败</span>
    <span className={styles.retry} onClick={retry}>重新加载</span>
  </span>
  else if (hasMore) return <SpinLoading color='primary' />
  else if (noneEnd) return null
  return <span>我是有底线的</span>
}
