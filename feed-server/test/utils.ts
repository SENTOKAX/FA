import axios from 'axios'

const baseURL = 'http://localhost:8080/api'

const request = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Cookie: 'token=b551f7df5f5ff1c43b8755a3;',
  },
})

export { request }
