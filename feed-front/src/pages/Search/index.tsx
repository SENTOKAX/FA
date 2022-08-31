import React, { useState } from 'react'
import { Dialog, SearchBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import { ReactComponent as IconClose } from '@/assests/imgs/close.svg'
import { ReactComponent as IconUp } from '@/assests/imgs/up.svg'
import PopCreate from '@/components/PopCreate'
import styles from './style.module.scss'

export default function Search() {
  const navigate = useNavigate()
  const [arr, setArr] = useState<string[]>(
    JSON.parse(localStorage.getItem('searchArr') as string) || []
  )

  const setSearch = async (val: string) => {
    if (val !== '' && /^[\s]*$/.test(val) !== true) {
      const temp = JSON.parse(JSON.stringify(arr))
      temp.unshift(val)
      localStorage.setItem('searchArr', JSON.stringify(temp))
      navigate(`/search/detail?keyword=${encodeURIComponent(val)}`)
    }
  }

  const setCopy = async (key: number) => {
    const span = searchArr[key]
    const temp = JSON.parse(JSON.stringify(arr))
    temp.unshift(span)
    localStorage.setItem('searchArr', JSON.stringify(temp))
    navigate(`/search/detail?keyword=${encodeURIComponent(span)}`)
  }
  const arrs = Array.from(new Set(arr.map((item) => JSON.stringify(item)))).map((i) =>
    JSON.parse(i)
  )
  localStorage.setItem('searchArr', JSON.stringify(arrs))
  const searchArr: string[] = JSON.parse(localStorage.getItem('searchArr') as string)

  const setDelete = async () => {
    const result = await Dialog.confirm({
      content: '是否清空历史记录',
    })
    if (result) {
      setArr([])
    }
  }

  return (
    <div className={styles.Search}>
      <div className={styles.header}>
        <SearchBar
          placeholder="搜索"
          clearOnCancel={true}
          showCancelButton={() => true}
          className={styles.shearch}
          onSearch={(val) => setSearch(val)}
        />
      </div>
      <div className={styles.list}>
        <div className={classNames(searchArr.length > 0 ? styles.lately : styles.show)}>
          <span>最近搜索</span>
          <IconClose onClick={setDelete} />
        </div>
        <div className={classNames(searchArr.length === 0 ? styles.nosearch : styles.noshow)}>
          <span>最近暂无搜索</span>
        </div>
        <div className={styles.wrap}>
          {searchArr.map((item: string, i: number) => (
            <div key={i} className={styles.item} onClick={() => setCopy(i)}>
              <span>{item}</span>
              <IconUp />
            </div>
          ))}
        </div>
      </div>
      <PopCreate />
    </div>
  )
}
