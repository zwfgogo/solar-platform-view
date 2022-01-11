import React, { useState, useMemo, useEffect, useRef } from 'react'
import moment from 'moment'
import videojs from 'video.js'
import { Button, notification } from 'wanke-gui'
import { isMicrogrid, isPvSystem, isStorageSystem, isTerminalSystem } from '../core/env'
import { history, useLocation } from 'umi'
import { Wanke1ScreenOutlined, WankeAlarmOutlined, WarningOutlined } from 'wanke-icon'
import classnames from 'classnames'
import utils from '../public/js/utils';

const NotificationKey = 'alarm-notification-key'
const duration = 30

enum EAlarmLevel {
  Serious = 'Serious',
  Moderate = 'Moderate',
  Slight = 'Slight',
  Ignore = 'Ignore'
}

const EAlarmLevelTitle = {
  [EAlarmLevel.Serious]: utils.intl('alarmNotify.故障'),
  [EAlarmLevel.Moderate]: utils.intl('alarmNotify.预警'),
  [EAlarmLevel.Slight]: utils.intl('alarmNotify.通知'),
  [EAlarmLevel.Ignore]: utils.intl('alarmNotify.忽略'),
}

const colorMap = {
  [EAlarmLevel.Serious]: 'red',
  [EAlarmLevel.Moderate]: 'orange',
  [EAlarmLevel.Slight]: 'blue',
}

const mockList = [EAlarmLevel.Serious, EAlarmLevel.Moderate, EAlarmLevel.Slight, EAlarmLevel.Ignore]

interface Props {
  eventAlarm: any[]
  disabled?: boolean
}

export default function useAlarmNotification(props?: Props) {
  const [eventAlarm, setEventAlarm] = useState([])
  const lastTimer = useRef<any>()

  useEffect(() => {
    if (!props.disabled && props.eventAlarm && props.eventAlarm.length > 0) {
      const newEventAlarm = eventAlarm.concat(props.eventAlarm)
      setEventAlarm(newEventAlarm.filter(item => item.alarmLevelName && item.alarmLevelName !== EAlarmLevel.Ignore))
    }
  }, [JSON.stringify(props.eventAlarm)]);

  useEffect(() => {
    if (eventAlarm && eventAlarm.length > 0) {
      openNotification()
    }
  }, [eventAlarm]);

  const shutVoice = () => {
    videojs('myVideo').pause()
    setEventAlarm([])
    if (lastTimer.current) {
      clearTimeout(lastTimer.current)
    }
    lastTimer.current = null
  }

  useEffect(() => {
    return () => {
      if (lastTimer.current) {
        clearTimeout(lastTimer.current)
        lastTimer.current = null
        closeNotification()
      }
    }
  }, [])

  const closeNotification = () => {
    notification.close(NotificationKey)
    shutVoice()
  }

  //弹出告警提示框
  const openNotification = () => {
    // for (let i = 0; i < this.state.eventAlarm.length; i++) {
    const message: any = {
      key: NotificationKey,
      className: 'alarm-notification',
      duration: 0,
      message: utils.intl('alarmNotify.告警'),
      placement: 'bottomRight',
      onClose: closeNotification,
      description: <AlarmNotification eventAlarm={eventAlarm} />
    }
    notification.open(message)
    if (lastTimer.current) {
      clearTimeout(lastTimer.current)
    }
    lastTimer.current = setTimeout(function () {
      closeNotification()
    }, duration * 1000)
    setTimeout(function () {
      videojs('myVideo').play()
    }, 2000)
  }
}

interface AlarmNotificationProps {
  eventAlarm: any[]
}

const AlarmNotification: React.FC<AlarmNotificationProps> = ({ eventAlarm }) => {
  const seriousList = []
  const moderateList = []
  const slightList = [] 

  eventAlarm.forEach(item => {
    switch (item.alarmLevelName) {
      case EAlarmLevel.Serious:
        seriousList.push(item)
        break
      case EAlarmLevel.Moderate:
        moderateList.push(item)
        break
      case EAlarmLevel.Slight:
        slightList.push(item)
        break
      default:
        break
    }
  })

  const jumpEvent = () => {
    videojs('myVideo').pause()
    notification.close(NotificationKey)
    if (isTerminalSystem()) {
      history.push('/operationDuty')
      history.push('/operationDuty/checkAbnormal')
    } else if (isStorageSystem() || isPvSystem() || isMicrogrid()) {
      if (window.location.pathname === '/abnormal-alarm/abnormal') {
        history.push('/abnormal-alarm')
      }
      history.push('/abnormal-alarm/abnormal')
    }
  }

  const renderAlarm = (alarmList: any[], type: EAlarmLevel) => {
    if (!alarmList.length) return null
    const labelList = []
    if (alarmList.length === 1) {
      const alarm = alarmList[0]
      labelList.push([utils.intl('alarmNotify.发生时间'), alarm.startTime])
      labelList.push([utils.intl('alarmNotify.设备对象'), alarm.devTitle])
      labelList.push([utils.intl('alarmNotify.异常详情'), alarm.alarmTitle])
    } else {
      const len = alarmList.length
      let deviceSet = new Set()
      alarmList.forEach(item => {
        deviceSet.add(item.devTitle)
      })
      labelList.push([utils.intl('alarmNotify.最新发生时间'), alarmList[len - 1].startTime])
      labelList.push([utils.intl('alarmNotify.设备数量'), Array.from(deviceSet).length])
      labelList.push([utils.intl('alarmNotify.事件数量'), len])
    }

    return (
      <section className="alarm-card">
        <div className="alarm-card-logo">
          <WankeAlarmOutlined className={classnames("alarm-card-logo-icon", colorMap[type])} />
          <span>{EAlarmLevelTitle[type]}</span>
        </div>
        <div className="alarm-card-content">
          {labelList.map((item, index) => (
            <p key={index}>
              <span>{item[0]}:</span>
              <span>{item[1]}</span>
            </p>
          ))}
        </div>
      </section>
    )
  }
  
  return (
    <div>
      {renderAlarm(seriousList, EAlarmLevel.Serious)}
      {renderAlarm(moderateList, EAlarmLevel.Moderate)}
      {renderAlarm(slightList, EAlarmLevel.Slight)}
      <div style={{ textAlign: 'right' }}>
        <Button onClick={jumpEvent}>{utils.intl('查看详情')}</Button>
      </div>
    </div>
  )
}
