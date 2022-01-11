import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import {Popover} from 'wanke-gui'
import {history} from 'umi'

import {WankeWarningOutlined, GfAlarmOutlined} from 'wanke-icon'
import utils from '../public/js/utils'
import {isMicrogrid, isPvSystem, isStorageSystem, isTerminalSystem} from '../core/env'
import moment from 'moment'

interface Props {
  fetchWarningCount: () => void
  moderateWarningCount: number
  seriousWarningCount: number
  warningMenuItem: boolean
}

const Warning: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.fetchWarningCount()
  }, [])
  let [visible, setVisible] = useState(false)

  const toWarningPage = (name) => {
    if (isTerminalSystem()) {
      history.push(`/operationDuty/checkAbnormal`)
    } else if (isStorageSystem() || isPvSystem() || isMicrogrid()) {
      history.push({
        pathname: '/abnormal-alarm/abnormal',
        query: {
          alarmLevelName: name,
          time: moment().valueOf()
        }
      })
    }
  }

  let total = props.moderateWarningCount + props.seriousWarningCount
  if (total > 999) {
    total = 999
  }
  return (
    <Popover
      visible={visible}
      onVisibleChange={visible => setVisible(visible)}
      placement='bottomRight'
      trigger="hover"
      content={
        <div className="system-warning-info">
          <div className="moderate-warning warning-item" onClick={() => toWarningPage('预警')}>
            <div className="content">
              <WankeWarningOutlined style={{fontSize: 22, marginBottom: '8px'}}/>
              {utils.intl('预警')}
            </div>
            <span className={classnames('waring-count', {})}>
              {props.moderateWarningCount <= 999 ? props.moderateWarningCount : '999+'}
            </span>
          </div>

          <div className="warning-item" style={{color: '#e73d3d'}} onClick={() => toWarningPage('故障')}>
            <div className="content">
              <WankeWarningOutlined style={{fontSize: 22, marginBottom: '8px'}}/>
              {utils.intl('故障')}
            </div>
            <span className={classnames('waring-count', {})}>
              {props.seriousWarningCount <= 999 ? props.seriousWarningCount : '999+'}
            </span>
          </div>
        </div>
      }
    >
      <div style={{position: 'relative'}}>
        {
          total > 0 && (
            <div className={classnames('system-warning vh-center')}>
            </div>
          )
        }
        <GfAlarmOutlined style={{color: '#92929d', fontSize: 28, cursor: 'pointer'}}/>
      </div>
    </Popover>
  )
}

export default Warning
