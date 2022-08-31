import request from './request'

export const SUCCESS = 0

export const upload = async (body: { file: File }) => {
  const { data } = await request.get(`/oss/upload?filename=${body.file.name}`)
  if (data.code === SUCCESS) {
    const ossParams = data.data
    ossParams.file = body.file
    const { status } = await request.post(ossParams.host, ossParams, {
      headers: {
        'Content-type': 'multipart/form-data',
      },
    })
    if (status === 200)
      return {
        code: 0,
        data: {
          url: data.data.url,
        },
      }
    return { code: 1100 }
  }
  return data
}
