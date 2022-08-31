import React from 'react'
import { Skeleton } from 'antd-mobile'
import classNames from 'classnames'

import styles from './style.module.scss'


type Props = {
  wrapperClassName?: string
}

export default function SkeletonItem({ wrapperClassName }: Props) {
  return (
    <div className={classNames(styles.skeleton, wrapperClassName)}>
      <div className={styles.customSkeleton}>
        <Skeleton animated className={styles.avatarSkeleton} />
        <Skeleton.Title animated />
      </div>
      <Skeleton.Paragraph lineCount={5} animated />
    </div>
  )
}
