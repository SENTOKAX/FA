import React from 'react'

import styles from './style.module.scss'
import { ReactComponent as IconUp } from '@/assests/imgs/up.svg'

interface IProps {
  height: number
  pageView: { current: HTMLDivElement | null }
}

export default function UpPage(props: IProps) {
  const { height, pageView } = props

  return (
    <div className={height > 200 ? styles.up : styles.show} onClick={() => pageView.current?.scrollTo({
      left: 0,
      top: 0,
      behavior: 'smooth'
    })}>
      <IconUp />
    </div>
  )
}
