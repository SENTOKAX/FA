import * as Joi from 'joi'
import {
  AtLeastOneContentOrImage,
  AtLeastOneContentOrOneImage,
  AtLeastOneCustom,
  ChineseNumber,
  ObjectIdCustom
} from './definition'
import { IFollowObjectStatus } from '../models/types'

const topMessageSession : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    id: Joi.string().custom(ObjectIdCustom).required()
  }),
  query: Joi.object({
    top: Joi.boolean().required()
  })
}


const getLatestPost : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    lastRequestId: Joi.string().custom(ObjectIdCustom).allow(''),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}


const hasLatestPost : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    lastRequestId: Joi.string().custom(ObjectIdCustom).allow('')
  })
}


const SendMessage : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    sendTo: Joi.string().custom(ObjectIdCustom).required(),
    content: Joi.string(),
    image: Joi.string().uri()
  }).custom(AtLeastOneContentOrOneImage)
}


const IdsSchema : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    ids: Joi.alternatives().try(Joi.array().items(Joi.string().custom(ObjectIdCustom)).min(1), Joi.string().custom(ObjectIdCustom)).required()
  })
}


const searchPost : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    keyword: Joi.string().default(''),
    account: Joi.string(),
    likeFor: Joi.string(),
    image: Joi.boolean(),
    like: Joi.boolean(),
    next: Joi.string().custom(ObjectIdCustom),
    prev: Joi.string().custom(ObjectIdCustom),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}

const accountInfo : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    account: Joi.string().required()
  })
}


const getPostReplyList : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    id: Joi.string().custom(ObjectIdCustom).required()
  }),
  query: Joi.object({
    next: Joi.string().custom(ObjectIdCustom),
    prev: Joi.string().custom(ObjectIdCustom),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}


const getPostAndReplyById : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    id: Joi.string().custom(ObjectIdCustom).required()
  }),
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}

const searchUser : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    keyword: Joi.string().allow('').default(''),
    uid: Joi.string().custom(ObjectIdCustom),
    follow: Joi.number().min(1).max(2).default(IFollowObjectStatus.Follower),
    next: Joi.string().custom(ObjectIdCustom),
    prev: Joi.string().custom(ObjectIdCustom),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}


const changeFocusStatus : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    uid: Joi.string().custom(ObjectIdCustom).required()
  }),
  query: Joi.object({
    follow: Joi.boolean().required()
  })
}


const changeLikeStatus : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    id: Joi.string().custom(ObjectIdCustom).required()
  }),
  query: Joi.object({
    like: Joi.boolean().required()
  })
}


const deletePost : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    id: Joi.string().custom(ObjectIdCustom).required()
  })
}


const createDefaultPost : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    content: Joi.string().allow('').custom(ChineseNumber(0, 280)),
    images: Joi.array().items(Joi.string().uri()).max(4)
  }).custom(AtLeastOneCustom)
}

const createChildrenPost : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    relationId: Joi.string().custom(ObjectIdCustom).required(),
    content: Joi.string().allow('').custom(ChineseNumber(0, 280)),
    images: Joi.array().items(Joi.string().uri()).max(4)
  }).custom(AtLeastOneContentOrImage)
}

const register : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    account: Joi.string().min(4).max(18).pattern(new RegExp('^[a-zA-Z0-9]*$')).required()
      .messages({
        'string.min': 'ErrTitleLengthNotCorrect',
        'string.max': 'ErrTitleLengthNotCorrect',
        'string.pattern.base': 'ErrTitleFormatNotCorrect'
      })
  })
}

const modifyUserInfo : Record<string, Joi.ObjectSchema> = {
  body: Joi.object({
    avatar: Joi.string().uri(),
    banner: Joi.string().uri(),
    bio: Joi.string().allow('').custom(ChineseNumber(0, 128)),
    nickname: Joi.string().custom(ChineseNumber(4, 18))
  }).custom(AtLeastOneCustom)
}


const WxLogin : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    code: Joi.string().required()
  })
}

const Upload : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    filename: Joi.string().required()
  })
}

const PagingSkipById : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    next: Joi.string().custom(ObjectIdCustom),
    prev: Joi.string().custom(ObjectIdCustom),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}

const PagingSkipByTime : Record<string, Joi.ObjectSchema> = {
  query: Joi.object({
    next: Joi.number(),
    prev: Joi.number(),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}

const DialogueMessage : Record<string, Joi.ObjectSchema> = {
  params: Joi.object({
    account: Joi.string().required()
  }),
  query: Joi.object({
    next: Joi.string().custom(ObjectIdCustom),
    prev: Joi.string().custom(ObjectIdCustom),
    limit: Joi.number().integer().min(1).max(20).default(10)
  })
}

export {
  WxLogin,
  Upload,
  modifyUserInfo,
  register,
  createDefaultPost,
  createChildrenPost,
  deletePost,
  changeLikeStatus,
  changeFocusStatus,
  searchUser,
  getPostAndReplyById,
  getPostReplyList,
  searchPost,
  PagingSkipById,
  IdsSchema,
  SendMessage,
  DialogueMessage,
  accountInfo,
  PagingSkipByTime,
  hasLatestPost,
  getLatestPost,
  topMessageSession
}
