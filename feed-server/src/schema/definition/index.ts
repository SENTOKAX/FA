import { ObjectId } from 'mongodb'
import { CustomHelpers } from 'joi'
import { IFollowObjectStatus } from '../../models/types'

const ObjectIdCustom = (id : string, helpers : CustomHelpers)=>{
  if (!id) return id
  let bid = undefined
  try {
    if (id){
      bid = new ObjectId(id)
    }
  }catch (e){
    throw new Error('object id parse error')
  }
  return bid
}

const AtLeastOneCustom = (values: Object, helpers : CustomHelpers)=>{
  if (Object.keys(values).length === 0) throw new Error('at least one params')
  return values
}

const AtLeastOneContentOrImage = (values: any, helpers : CustomHelpers)=>{
  if (!values?.images && !values.content) throw new Error('images and content at least one not empty')
  return values
}

const AtLeastOneContentOrOneImage = (values: any, helpers : CustomHelpers)=>{
  if (!values?.image && !values.content) throw new Error('images and content at least one not empty')
  return values
}

const ChineseNumber = (min : number, max : number)=>{
  return (value: any, helpers : CustomHelpers)=>{
    let len = 0
    for (let i = 0; i < value.length; i++) {
      len += value.charCodeAt(i) > 255 ? 2 : 1
    }
    if (len < min || len > max) throw new Error(`长度在${min}和${max}`)
    return value
  }
}

export {
  ObjectIdCustom,
  AtLeastOneCustom,
  AtLeastOneContentOrImage,
  AtLeastOneContentOrOneImage,
  ChineseNumber
}
