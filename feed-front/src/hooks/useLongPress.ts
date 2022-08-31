import { RefObject, useCallback, useEffect, useState } from 'react'

type Props<T extends HTMLElement> = {
  ref: RefObject<T>
  onLongTap ?: ()=> void
  onClick ?: ()=> void
}

export default function useLongPress<T  extends HTMLElement>({ ref , onLongTap, onClick } : Props<T>){
  const [ longClick, setLongClick ] = useState(false)
  const [ timeoutEvent, setTimeoutEvent ] = useState<NodeJS.Timeout>()
  const [ pressDom, setPressDom ] = useState(ref?.current)

  const longTapStart = useCallback(async ()=>{
    setTimeoutEvent(setTimeout(async ()=>{
      setLongClick(true)
      onLongTap && onLongTap()
    }, 1000))
  }, [onLongTap])

  const longTaping = useCallback((event : Event)=> {
    clearTimeout(timeoutEvent)
    setLongClick(false)
    setTimeoutEvent(undefined)
  }, [timeoutEvent])

  const longTapEnd = useCallback((event : Event)=> {
    clearTimeout(timeoutEvent)
    setLongClick(false)
    setTimeoutEvent(undefined)
    if (timeoutEvent !== undefined && !longClick) onClick && onClick()
  }, [longClick, onClick, timeoutEvent])

  useEffect(()=>{
    setPressDom(ref?.current)
  }, [ref])

  useEffect(()=>{
    if(!pressDom) return
    pressDom.addEventListener('touchstart', longTapStart)
    pressDom.addEventListener('touchmove', longTaping)
    pressDom.addEventListener('touchend', longTapEnd)
    document.addEventListener('contextmenu', event => event.preventDefault())
    return ()=>{
      pressDom.removeEventListener('touchstart', longTapStart)
      pressDom.removeEventListener('touchmove', longTaping)
      pressDom.removeEventListener('touchend', longTapEnd)
      document.removeEventListener('contextmenu', event => event.preventDefault())
    }
  }, [longTapEnd, longTapStart, longTaping, pressDom, ref])

}
