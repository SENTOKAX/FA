import React from 'react'

import PopAvatar from '@/components/PopAvatar'
import List from './List'
import styles from './style.module.scss'
import PopCreate from '@/components/PopCreate'
export default function Notice() {
  return (
    <React.Fragment>
      <div className={styles.notice}>
        <div className={styles.header}>
          <div className={styles.inner}>
            <PopAvatar />
            <div className={styles.title}>通知</div>
          </div>
        </div>
        <List />
      </div>
      <PopCreate />
    </React.Fragment>
  )
}
