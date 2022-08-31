import axios from 'axios'
import config from '../config'

export const getAccessToken = async (code : string)=>{
  const {data} = await axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wechatAuth.appId}&secret=${config.wechatAuth.appSecret}&code=${code}&grant_type=authorization_code`)
  return data
}

export const getUserInfoFromWechat = async (access_token : string, openid : string)=>{
  const {data} = await axios.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`)
  return data
}
