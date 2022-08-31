import { Badge, SafeArea, TabBar } from 'antd-mobile'
import React, { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'

import styles from './style.module.scss'
import useNotice from '@/hooks/useNotice'
import { noticeStore } from '@/store/noticeStore'
import { useMessage } from '@/hooks/useMessage'
import { messageListStore } from '@/store/messageListStore'
import usePost from '@/hooks/usePost'
import { postStore } from '@/store/postStore'
import { ReactComponent as IconHome } from '../../assests/imgs/home.svg'
import { ReactComponent as IconMessage } from '../../assests/imgs/message.svg'
import { ReactComponent as IconNotice } from '../../assests/imgs/notice_fill.svg'
import { ReactComponent as IconSearch } from '../../assests/imgs/search.svg'

function App() {
  const navigate = useNavigate()
  const { hasNew } = postStore
  const { unRead } = noticeStore
  const { unRead: messageListUnRead } = messageListStore
  const location = useLocation()

  const { noticeList, run, cancel } = useNotice()
  const { getPostList, run: postRun, cancel: postCancel, loadNewest } = usePost()
  const { loadInfo, run: messageRun, cancel: messageCancel } = useMessage()
  useEffect(() => {
    loadInfo().then()
    noticeList().then()
    getPostList().then()
    setTimeout(() => {
      postRun()
      messageRun()
      run()
    }, 3000)
    return () => {
      postCancel()
      messageCancel()
      cancel()
    }
  }, [
    cancel,
    getPostList,
    loadInfo,
    messageCancel,
    messageRun,
    noticeList,
    postCancel,
    postRun,
    run,
  ])

  const pageView = useRef<HTMLDivElement | null>(null)

  let count = 0
  function doubleClick() {
    count += 1
    setTimeout(() => {
      if (count === 1) {
        return
      } else if (count === 2) {
        loadNewest()
        pageView.current?.children[0].children[1]?.scrollTo({
          left: 0,
          top: 0,
          behavior: 'smooth'
        })
      }
      count = 0
    }, 300)
  }

  return (
    <div className={styles.page} ref={pageView}>
      <Outlet />
      <TabBar
        safeArea
        className={styles.navbar}
        activeKey={'/' + location.pathname.split('/')[1]}
        onChange={(key) => navigate(key)}
      >
        <TabBar.Item
          key="/"
          icon={
            <Badge
              content={hasNew ? Badge.dot : null}
              style={{ '--right': '-5px' }}
              className={styles.badge}
            >
              <IconHome onClick={() => doubleClick()} />
            </Badge>
          }
        />
        <TabBar.Item key="/search" icon={<IconSearch />} />
        <TabBar.Item
          key="/notice"
          icon={
            <Badge
              content={unRead === 0 ? null : unRead > 99 ? '99+' : unRead}
              style={{ '--right': unRead > 99 ? '-8px' : '-5px' }}
            >
              <IconNotice />
            </Badge>
          }
        />
        <TabBar.Item
          key="/message"
          icon={
            <Badge
              content={
                messageListUnRead === 0 ? null : messageListUnRead > 99 ? '99+' : messageListUnRead
              }
              style={{ '--right': messageListUnRead > 99 ? '-8px' : '-5px' }}
            >
              <IconMessage />
            </Badge>
          }
        />
      </TabBar>
      <SafeArea position='bottom' />
    </div>
  )
}

export default observer(App)
