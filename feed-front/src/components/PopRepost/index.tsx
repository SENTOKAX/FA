import React, { useState } from 'react'
import { Button, Popup, TextArea, Toast } from 'antd-mobile'
import ImageUploader, { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'
import { observer } from 'mobx-react-lite'
import { useRequest } from 'ahooks'

import styles from './style.module.scss'
import PostContent from '../PostContent'
import usePost from '@/hooks/usePost'
import useChineseInput from '@/hooks/useChineseInput'
import { upload } from '@/service/oss.service'
import { userStore } from '@/store/userStore'
import { IPost } from '@/libs/types'
import { formatTime } from '@/utils/time'
import { ReactComponent as IconRepost } from '@/assests/imgs/repost.svg'
import { ReactComponent as IconImage } from '@/assests/imgs/img.svg'

interface IProps {
  post: IPost
  onRepostSuccess?: (post: IPost) => void
}

function PopRepost(props: IProps) {
  const { _id, createAt } = props.post
  const { avatar, nickname, account } = props.post.user
  const { transmit } = usePost()
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [fileList, setFileList] = useState<ImageUploadItem[]>([])
  const { value, onValueChange, inputNumbers, maxNumbers, maxCharNumber, setValue, handleComposition } = useChineseInput(280)
  async function _onFinish() {
    if (loading) {
      Toast.show('图片未上传完成')
      return
    }
    const images = fileList.map((file) => file.url)
    if (images.length === 0 && value === '') {
      Toast.show('内容不能为空')
      return
    }
    const { code, data } = await transmit(value, images, _id, props.post)
    if (code === 0) {
      props.onRepostSuccess && props.onRepostSuccess(data)
      setValue('')
      setFileList([])
      setVisible(false)
    }
  }
  const { run: onFinish } = useRequest(_onFinish, {
    debounceWait: 300,
    manual: true
  })
  function beforeUpload(file: File) {
    const type = ['image/gif', 'image/jpeg', ' image/jpg', 'image/png']
    if (!type.includes(file.type)) {
      Toast.show('图片类型不符合要求')
      return null
    }
    if (file.size > 4 * 1024 * 1024) {
      Toast.show('请选择小于 4M 的图片')
      return null
    }
    if (fileList.length > 3) {
      Toast.show('最多只能上传四张图片')
      return null
    }
    return file
  }

  async function mockUpload(file: File) {
    setLoading(true)
    const { code, data } = await upload({
      file,
    })
    if (code === 0) {
      setLoading(false)
      return {
        url: data.url,
      }
    }
    setLoading(false)
    return {
      url: null,
    }
  }

  return (
    <React.Fragment>
      <div
        className={styles.icon}
        onClick={() => {
          setVisible(true)
        }}
      >
        <IconRepost />
      </div>

      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false)
        }}
        bodyStyle={{ height: '100vh' }}
      >
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.cancel} onClick={() => setVisible(false)}>
              取消
            </div>
            <div
              className={styles.release}
              onClick={() => {
                onFinish()
              }}
            >
              <Button color="primary" shape="rounded" className={styles.btn}>
                发布
              </Button>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.repost}>
              <div className={styles.left}>
                <div className={styles.avatar}>
                  <img src={userStore.user.avatar} alt="" />
                </div>
              </div>
              <div className={styles.right}>
                <TextArea
                  onCompositionStart={handleComposition}
                  onCompositionEnd={handleComposition}
                  placeholder="这一刻的想法..."
                  showCount={() => <div className='adm-text-area-count'>{inputNumbers}/{maxCharNumber}</div>}
                  value={value}
                  onChange={onValueChange}
                  maxLength={maxNumbers}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  className={styles.text}
                />
                <div className="uploadImg">
                  <ImageUploader
                    value={fileList}
                    onChange={setFileList}
                    upload={mockUpload}
                    beforeUpload={beforeUpload}
                  >
                    <div className={styles.img}>
                      <IconImage />
                    </div>
                  </ImageUploader>
                </div>
              </div>
            </div>
            <div className={styles.post}>
              <div className={styles.info}>
                <div className={styles.postAvatar}>
                  <img src={avatar} alt="" />
                </div>
                <span className={styles.name}>{nickname}</span>
                <span className={styles.account}>{'@' + account + ' · ' + formatTime(createAt)}</span>
              </div>
              <div className={styles.postContent}>
                <PostContent _id={props.post?._id} content={props.post.content} images={props.post.images}
                  processImages={props.post.processImages} />
              </div>
            </div>
          </div>
          <div className={styles.footer} />
        </div>
      </Popup>
    </React.Fragment>
  )
}

export default observer(PopRepost)
