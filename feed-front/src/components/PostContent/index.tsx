import React, { useCallback, useMemo } from 'react'
import { Ellipsis, ImageViewer } from 'antd-mobile'
import classNames from 'classnames'
import { Image } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

import styles from './style.module.scss'
import { formatTime } from '@/utils/time'

type Props = {
  _id?: string
  className?: string
  content?: string
  images?: string[]
  processImages?: string[]
  transmit?: {
    deleted: boolean
    _id?: string
    content?: string
    images?: string[]
    processImages?: string[]

    createAt: number
    user: {
      avatar: string
      nickname: string
      account: string
    }
  }
}

const PostContent = (props: Props) => {
  const { images = [], content = '', transmit, processImages = [] } = props
  const navigate = useNavigate()

  const viewImage = useCallback(
    (index: number) => {
      ImageViewer.Multi.show({
        defaultIndex: index,
        images,
      })
    },
    [images]
  )

  const renderImages = useMemo(() => {
    return (
      <div
        className={classNames(styles.images, {
          [styles['images-none']]: processImages.length === 0,
          [styles['images-row']]: processImages.length <= 3,
          [styles['images-four']]: processImages.length === 4,
          [styles['images-many']]: processImages.length > 4,
        })}
      >
        {processImages.map((processImage, index) => (
          <Image
            onClick={(event) => {
              event.stopPropagation()
              viewImage(index)
            }}
            key={'image' + index}
            className={classNames(styles.image, {
              [styles['image-one']]: processImages.length === 1,
              [styles['image-two']]: processImages.length === 2,
              [styles['image-three']]: processImages.length === 3,
              [styles['image-four']]: processImages.length === 4,
              [styles['image-many']]: processImages.length === 5,
            })}
            src={processImage}
            alt={processImage}
            fit="cover"
          />
        ))}
      </div>
    )
  }, [processImages, viewImage])

  const renderTransmit = useMemo(() => {
    if (transmit) {
      return (
        <div className={styles.transmit}>
          {transmit.deleted ? (
            <div className={styles.deleted}>帖子已删除</div>
          ) : (
            <>
              <div className={styles.info}>
                <div className={styles.postAvatar}>
                  <img src={transmit?.user?.avatar} alt="" />
                </div>
                <span className={styles.name}>{transmit?.user?.nickname}</span>
                <span className={styles.time}>
                  {'@' + transmit?.user?.account + ' · ' + formatTime(transmit.createAt)}
                </span>
              </div>
              <PostContent
                _id={transmit._id}
                className={styles['transmit-content']}
                content={transmit.content}
                images={transmit.images}
                processImages={transmit.processImages}
              />
            </>
          )}
        </div>
      )
    }
  }, [transmit])

  return (
    <div className={props.className}>
      <Ellipsis
        className={classNames(styles.content, {
          [styles['content-hidden']]: content.length === 0,
        })}
        direction="end"
        rows={4}
        content={content.length > 0 ? content : '分享图片'}
        expandText="更多"
        collapseText="收起"
        onContentClick={() => {
          if (props._id)
            if (window.location.pathname.split('/')[2] !== props._id)
              navigate(`/post/${props?._id}`)
        }}
      />
      {renderImages}
      {renderTransmit}
    </div>
  )
}

export default PostContent
