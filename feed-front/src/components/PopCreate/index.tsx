import React, { useState } from 'react'
import { Button, Popup, TextArea, Toast } from 'antd-mobile'
import ImageUploader, { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'
import { observer } from 'mobx-react-lite'
import { useRequest } from 'ahooks'

import usePost from '@/hooks/usePost'
import useChineseInput from '@/hooks/useChineseInput'
import styles from './style.module.scss'
import { ReactComponent as IconCreate } from '@/assests/imgs/create.svg'
import { ReactComponent as IconImage } from '@/assests/imgs/img.svg'
import { upload } from '@/service/oss.service'
import { userStore } from '@/store/userStore'

function PopCreate() {
  const { create } = usePost()
  const [visible, setVisible] = useState(false)
  const { value, onValueChange, inputNumbers, maxNumbers, maxCharNumber, setValue, handleComposition } = useChineseInput(280)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<ImageUploadItem[]>([])

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
    const { code } = await create(value, images)
    if (code === 0) {
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
        className={styles.create}
        onClick={() => {
          setVisible(true)
        }}
      >
        <IconCreate />
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
              <Button
                color="primary"
                shape="rounded"
                className={styles.btn}
              >
                发布
              </Button>
            </div>
          </div>
          <div className={styles.content}>
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
          <div className={styles.footer}></div>
        </div>
      </Popup>
    </React.Fragment>
  )
}

export default observer(PopCreate)
