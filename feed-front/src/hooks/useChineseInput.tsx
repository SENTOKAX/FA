import { useCallback, useEffect, useState } from 'react'

export default function useChineseInput(initMaxCharNumber: number, initValue  = '') {
  const [value, setValue] = useState('')
  const [maxCharNumber] = useState(initMaxCharNumber)
  const [inputNumbers, setInputNumbers] = useState(0)
  const [maxNumbers, setMaxNumbers] = useState(initMaxCharNumber)
  const [compositionLock, setCompositionLock] = useState(false)

  const handleValue = useCallback((str : string)=>{
    let len = 0
    let fullIndex = 0
    for (let i = 0; i < str.length; i++) {
      len += str.charCodeAt(i) > 255 ? 2 : 1
      if (len > maxCharNumber && fullIndex === 0) {
        fullIndex = i
      }
    }
    setValue(fullIndex !== 0 ? str.substring(0, fullIndex) : str)
    setInputNumbers(len > maxCharNumber ? maxCharNumber : len)
    setMaxNumbers(len <= maxCharNumber ? str.length + maxCharNumber - (len > maxCharNumber ? maxCharNumber : len) : fullIndex)
  }, [maxCharNumber])

  const handleComposition = useCallback((event : any) => {
    if (event.type === 'compositionend') {
      setCompositionLock(false)
      handleValue(value)
    } else {
      setCompositionLock(true)
    }
  }, [handleValue, value])

  const onValueChange = useCallback((str: string) => {
    setValue(str)
    if (compositionLock) return
    handleValue(str)
  }, [compositionLock, handleValue])

  useEffect(() => {
    handleValue(initValue || '')
  }, [initValue, handleValue])

  return {
    onValueChange,
    value,
    setValue,
    inputNumbers,
    maxNumbers,
    maxCharNumber,
    handleComposition
  }
}
