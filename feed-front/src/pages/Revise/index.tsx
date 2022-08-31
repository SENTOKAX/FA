import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { Dialog, ImageUploader, NavBar, SpinLoading, TextArea, Toast } from 'antd-mobile'
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'

import { ReactComponent as IconBack } from '@/assests/imgs/back.svg'
import { ReactComponent as IconImage } from '@/assests/imgs/image.svg'
import styles from './style.module.scss'
import { userStore } from '@/store/userStore'
import useChineseInput from '@/hooks/useChineseInput'
import { upload } from '@/service/oss.service'
import usePost from '@/hooks/usePost'

function Revise() {
  const [user, setUser] = useState(userStore.user)
  const [loading, setLoading] = useState(false)
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const [avatarImg, setAvatarImg] = useState<ImageUploadItem[]>()
  const [bannerImg, setBannerImg] = useState<ImageUploadItem[]>()
  const { getPostList } = usePost()
  const {
    value: bio,
    onValueChange: onBioChange,
    inputNumbers: boiInputNumbers,
    maxNumbers: bioMaxNumbers,
    maxCharNumber: bioMaxCharNumber,
    handleComposition: bioHandleComposition
  } = useChineseInput(128, userStore.user.bio)
  const {
    value: nickname,
    onValueChange: onNicknameChange,
    inputNumbers: nicknameInputNumbers,
    maxNumbers: nicknameMaxNumbers,
    handleComposition: nicknameHandleComposition
  } = useChineseInput(18, userStore.user.nickname)

  const navigate = useNavigate()
  const back = async () => {
    if (loading || loadingAvatar) {
      Toast.show('请等待图片上传完成')
      return
    }
    if (userStore.user.nickname !== nickname || userStore.user.bio !== bio
      || (!!avatarImg?.slice(-1)[0].url && userStore.user.avatar !== user.avatar)
      || (!!bannerImg?.slice(-1)[0].url && userStore.user.banner !== user.banner)
    ) {
      const result = await Dialog.confirm({
        content: '用户信息已修改，是否保存',
      })
      if (result) {
        await onFinish()
      } else {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  async function avatarUpload(file: File) {
    setLoadingAvatar(true)
    const { code, data } = await upload({
      file,
    })
    if (code === 0) {
      setUser(Object.assign({}, user, { avatar: data.url }))
      setLoadingAvatar(false)
      return {
        url: data.url,
      }
    }
    setLoadingAvatar(false)
    return {
      url: null,
    }
  }

  async function bannerUpload(file: File) {
    setLoading(true)
    const { code, data } = await upload({
      file,
    })
    if (code === 0) {
      setUser(Object.assign({}, user, { banner: data.url }))
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

  async function onFinish() {
    if (!nickname) {
      Toast.show('昵称不能为空')
      return
    }
    if (nicknameInputNumbers < 4 || nicknameInputNumbers > 18) {
      Toast.show('昵称长度为4-18')
      return
    }
    if (loading || loadingAvatar) {
      Toast.show('请等待图片上传完成')
      return
    }
    if (await userStore.modifyUserInfo({
      avatar: avatarImg?.slice(-1)[0].url,
      banner: bannerImg?.slice(-1)[0].url,
      bio,
      nickname
    })
    )
      await getPostList()
    navigate('/')
  }

  function beforeUpload(file: File) {
    const type = ['image/gif', 'image/jpeg', ' image/jpg', 'image/png']
    if (!type.includes(file.type)) {
      Toast.show('图片类型不符合要求')
      return null
    }
    if (file.size > 2 * 1024 * 1024) {
      Toast.show('请选择小于 2M 的图片')
      setLoadingAvatar(false)
      return null
    }
    return file
  }

  return (
    <div className={styles.revise}>
      <NavBar
        backArrow={<IconBack/>}
        right={<span onClick={onFinish}>保存</span>}
        onBack={back}
        style={{ margin: '0 8px', fontSize: '16px' }}
      >
        编辑个人资料
      </NavBar>
      <div className={styles.list}>
        <div className={styles.bc}>
          <div className={styles.image}>
            {loading ? (
              <div className={styles.loading}>
                <SpinLoading color='white'/>
              </div>
            ) : null}
            <img src={user.banner} alt=""/>
          </div>

          <div className="image_btn">
            <ImageUploader value={bannerImg} onChange={setBannerImg} upload={bannerUpload} beforeUpload={beforeUpload}>
              {loading ? null : <IconImage/>}
            </ImageUploader>
          </div>
        </div>
        <div className={styles.avatar}>
          <div className={styles.picture}>
            {loadingAvatar ? (
              <div className={styles.loadingAvatar}>
                <SpinLoading color='white'/>
              </div>
            ) : null}
            <img src={user.avatar} alt=""/>
          </div>
          <div className="pic_btn">
            <ImageUploader value={avatarImg} onChange={setAvatarImg} upload={avatarUpload} beforeUpload={beforeUpload}>
              {loadingAvatar ? null : <IconImage/>}
            </ImageUploader>
          </div>
        </div>
      </div>
      <div className={styles.name}>
        <span>姓名</span>
        <TextArea
          onCompositionStart={nicknameHandleComposition}
          onCompositionEnd={nicknameHandleComposition}
          autoSize={{ maxRows: 1 }}
          placeholder="请输入姓名"
          value={nickname}
          onChange={onNicknameChange}
          style={{ '--font-size': '16px' }}
          maxLength={nicknameMaxNumbers}
        />
      </div>
      <div className={styles.introduce}>
        <span className={styles.item}>介绍</span>
        <div className={styles.content}>
          <TextArea
            onCompositionStart={bioHandleComposition}
            onCompositionEnd={bioHandleComposition}
            placeholder="请输入个人介绍"
            autoSize={{ minRows: 5 }}
            value={bio}
            onChange={onBioChange}
            style={{ '--font-size': '16px' }}
            maxLength={bioMaxNumbers}
            showCount={() => <div className='adm-text-area-count'>{boiInputNumbers}/{bioMaxCharNumber}</div>}
          />
        </div>
      </div>
    </div>
  )
}

export default observer(Revise)
