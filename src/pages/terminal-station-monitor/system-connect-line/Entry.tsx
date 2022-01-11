import React, { useEffect, useState } from 'react'
import ConnectLine from './index'
import { makeConnect } from '../../umi.helper'
import { globalNS } from '../../constants'
import Page from '../../../components/Page'
import { isTerminalSystem } from '../../../core/env'
import utils from '../../../public/js/utils'

interface Props {
  selectedStationId: number
  pageId: number
  selectedStationCode: number
}

const Entry: React.FC<Props> = function (this: null, props) {
  const [stationId, setStationId] = useState(isTerminalSystem() ? sessionStorage.getItem('station-id') : props.selectedStationId)

  const [stationCode, setStationCode] = useState(props.selectedStationCode)
  useEffect(() => {
    if (isTerminalSystem()) {
      return
    }
    setStationId(null)
    setTimeout(() => {
      setStationId(props.selectedStationId)
    }, 10)
  }, [props.selectedStationId])

  useEffect(() => {
    if (isTerminalSystem()) {
      return
    }
    setStationCode(null)
    setTimeout(() => {
      setStationCode(props.selectedStationCode)
    }, 10)
  }, [props.selectedStationCode])
  return (
    <Page pageId={props.pageId} showStation={true}>
      {
        !stationCode && (
          <div className="vh-center wh100 no-data-tip">
            {utils.intl('请先选择电站')}
          </div>
        )
      }
      {
        stationCode && (
        <ConnectLine
          key="connect"
          selectedStationId={stationId}
          selectedStationCode={stationCode}
          backgroundColor={stationCode !== 1116 ? true : false}
        />)
      }
    </Page>
  )
}

function mapPropsToState(model, { }, state) {
  return {
    selectedStationId: state[globalNS].selectedStationId,
    selectedStationCode: state[globalNS].selectedStationCode
  }
}

export default makeConnect('connect-line', mapPropsToState)(Entry)
