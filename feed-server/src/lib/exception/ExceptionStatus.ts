import { ErrorUnifyResponse } from './UnifyResponse'

export const SUCCESS = 0

const ExceptionStatus = {
  ErrUserCancelled: new ErrorUnifyResponse(1000, '用户被禁用'),
  ErrUserNotLogin: new ErrorUnifyResponse(1001, '用户未登录', 401),
  ErrTokenTimeout: new ErrorUnifyResponse(1002, '登录过期', 401),
  ErrLogin: new ErrorUnifyResponse(1003, '微信认证登录失败'),
  ErrRegistering: new ErrorUnifyResponse(1004, '请完成注册流程'),
  ErrHasRegister: new ErrorUnifyResponse(1005, '用户已注册'),
  ErrUserNotExist: new ErrorUnifyResponse(1006, '用户不存在'),
  ErrAccountExist: new ErrorUnifyResponse(1007, '用户名被占用'),
  ErrTitleLengthNotCorrect: new ErrorUnifyResponse(1008, '用户名长度为4-18'),
  ErrTitleFormatNotCorrect: new ErrorUnifyResponse(1009, '用户名只能为字母、数字'),

  ErrHasLike: new ErrorUnifyResponse(1201, '已点赞'),
  ErrNotLike: new ErrorUnifyResponse(1202, '未点赞'),

  ErrPostNotFind: new ErrorUnifyResponse(1300, '帖子未找到或被删除'),
  ErrPostDeleteNotPermission: new ErrorUnifyResponse(1301, '无法删除帖子'),

  ErrFocusSelf: new ErrorUnifyResponse(1400, '用户不能关注自己'),
  ErrFocusNotExist: new ErrorUnifyResponse(1401, '关注用户不存在'),

  ErrMessageSessionNotFind: new ErrorUnifyResponse(1500, '会话未找到'),

  ErrSendToSelf: new ErrorUnifyResponse(1600, '不能给自己发私信'),
  ErrSendDialogue: new ErrorUnifyResponse(1601, '不存在和自己的私信列表'),

  Error: new ErrorUnifyResponse(1100, 'OSS错误'),

  ErrParamError: new ErrorUnifyResponse(4000, '参数错误', 400),

  ErrServerInternal: new ErrorUnifyResponse(5000, '服务器内部异常', 500),
}

export default ExceptionStatus
