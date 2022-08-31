import axios from 'axios'
import { Toast } from 'antd-mobile'
import { UserStatus } from '@/libs/types'

const noLogPath = ['/login']

// 创建一个实例
const instance = axios.create({
  baseURL: '/api',
  validateStatus: (status) => status < 500,
})

// 拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.status === 401 && !noLogPath.includes(window.location.pathname)) {
      Toast.show('未登录')
      window.location.href = '/login'
      return Promise.reject(response)
    } else if (
      response.status === 200 &&
      noLogPath.includes(window.location.pathname) &&
      response.config.url === '/user/info'
    ) {
      if (response.data.data.status === UserStatus.Normal) window.location.href = '/'
      else if (response.data.data.status === UserStatus.Registering)
        window.location.href = '/register'
    }
    if (response.status === 200 && response.data.code === 1004) {
      window.location.href = '/register'
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default instance
