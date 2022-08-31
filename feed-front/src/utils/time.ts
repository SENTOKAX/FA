import dayjs from 'dayjs'

export function formatTime(datePre: number) {
  const dateNew = dayjs(new Date().getTime())
  const dateOld = dayjs(datePre).format('YYYY-MM-DD')
  const date = dateNew.diff(datePre, 'day')
  const hour = dateNew.diff(datePre, 'hour')
  const minute = dateNew.diff(datePre, 'minute')
  if (hour < 1) {
    if (minute < 1){
      return '刚刚'
    }
    return minute + ' 分钟'
  }else if (hour < 24) {
    return hour + ' 小时'
  }else if (hour < 24 * 15) {
    return date + ' 天'
  }
  return dateOld
}

export function formatMessageTime(datePre : number){
  const dateNew = dayjs(new Date().getTime())
  const day = dateNew.diff(datePre, 'day')
  if(day < 1) return dayjs(datePre).format('HH:mm')
  else if (dateNew.year() === dayjs(datePre).year()) return dayjs(datePre).format('MM-DD HH:mm')
  return dayjs(datePre).format('YYYY-MM-DD HH:mm')
}
