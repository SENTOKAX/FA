import { SUCCESS } from './ExceptionStatus'

export class UnifyResponse{
  code : number
  data ?: any

  constructor(code : number, data ?: any) {
    this.data = data
    this.code = code
  }

  static success(data ?: any){
    return new UnifyResponse(SUCCESS, data)
  }
}

export class ErrorUnifyResponse extends UnifyResponse{
  message: string
  status: number

  constructor(code: number, message: string, status = 200) {
    super(code)
    this.message = message
    this.status = status
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message
    }
  }
}
