import React, { ReactNode, useEffect } from 'react'
import { Toast } from 'antd-mobile'
import { RedoOutline } from 'antd-mobile-icons'
import { ErrorBlock } from 'antd-mobile'
import classNames from 'classnames'

import styles from './style.module.scss'
import { userStore } from '@/store/userStore'

type Props = {
  description?: string
  title?: string
  fresh?: () => void
  className?: string
  button?: ReactNode
  noneImage?: boolean
}

export default function Error({
  title = '',
  fresh,
  className,
  button,
  description = '',
  noneImage = false,
}: Props) {
  useEffect(() => {
    return () => {
      userStore.freshUserInfo()
    }
  }
  , [])
  return (
    <div
      className={classNames(styles.error, className, {
        [styles['none-image']]: noneImage,
      })}
    >
      <ErrorBlock description={description} title={title}>
        {button ? (
          button
        ) : (
          <div
            onClick={ () => {
              try {
                fresh && fresh()
              } catch (e: any) {
                Toast.show(e.message)
              }
            }}
            className={styles.refresh}
          >
            <RedoOutline />
            <span>刷新</span>
          </div>
        )}
      </ErrorBlock>
    </div>
  )
}
