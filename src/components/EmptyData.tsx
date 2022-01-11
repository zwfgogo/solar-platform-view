import React, { useEffect, useState } from 'react'
import { getSystemTheme } from '../core/env'
import utils from '../public/js/utils'
const lightEmptyImg = require('../static/img/no-data-table-light.svg')
const darkEmptyImg = require('../static/img/no-data-table-dark.svg')
import './style/empty-data.less'

function isLightTheme() {
  const theme = getSystemTheme()
  let isLight = theme == 'light' || theme == 'light-theme'
  return isLight
}

interface Props {
  message?: string
}

const EmptyData: React.FC<Props> = ({ message }) => {
  const [isLight, setIsLight] = useState(isLightTheme())

  const handleThemeChange = () => {
    setIsLight(isLightTheme())
  }

  useEffect(() => {
    window.addEventListener('theme-change', handleThemeChange)
    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
    }
  }, [])

  return (
    <div className="empty-data" style={{ textAlign: 'center', marginTop: 14 }}>
      <img src={isLight ? lightEmptyImg : darkEmptyImg} />
      <p className="empty-data-tip">{message ? message : utils.intl('暂无数据')}</p>
    </div>
  )
}

export default EmptyData
