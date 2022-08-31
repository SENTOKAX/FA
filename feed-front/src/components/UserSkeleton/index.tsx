import React from 'react'
import { Skeleton } from 'antd-mobile'

import styles from './style.module.scss'

export default function SkeletonItem() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.customSkeleton}>
        <Skeleton animated className={styles.avatarSkeleton} />
        <Skeleton.Paragraph lineCount={2} animated className={styles.paragraph} />
      </div>
    </div>
  )
}
