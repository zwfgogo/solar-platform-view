import React, { useEffect, useState } from 'react'
import ConnectLine from './index'
import { makeConnect } from '../../umi.helper'
import { globalNS } from '../../constants'
import Page from '../../../components/Page'
import { isTerminalSystem } from '../../../core/env'
import utils from '../../../public/js/utils'
import { Radio } from 'wanke-gui'
import './flow-entry.less'

const svgList = [
  { title: 'A组', value: 'flow' },
  { title: 'B组', value: 'flow-b' },
  { title: 'C组', value: 'flow-c' },
  { title: 'D组', value: 'flow-d' }
]

interface Props {
  pageId: number
  stationList: any[]
}

const FlowEntry: React.FC<Props> = function (this: null, props) {
  const [stationId, setStationId] = useState()
  const [stationCode, setStationCode] = useState()
  const [svgKey, setSvgKey] = useState('flow')

  const flowStation = props.stationList.find(item => item.code === 1116)
  const isFlow = flowStation?.code === 1116

  const changeSvg = (flowStation) => {
    setStationCode(null)
    setStationId(null)
    setTimeout(() => {
      setStationCode(flowStation.code)
      setStationId(flowStation.id)
    }, 10)
  }

  useEffect(() => {
    if (isFlow) {
      changeSvg(flowStation)
    } else {
      setStationCode(null)
      setStationId(null)
    }
  }, [isFlow, svgKey])

  return (
    <Page pageId={props.pageId} key="flow-page" style={{ position: 'relative', height: 'calc(100% - 32px)', backgroundColor: "#101619" }}>
      <div className='flow-entry-btn' style={{ position: 'absolute', top: 8, right: 8, zIndex: 99 }}>
        <Radio.Group
          onChange={e => {
            setSvgKey(e.target.value);
          }}
          value={svgKey}
        >
          {svgList.map(item => (
            <Radio.Button key={item.value} value={item.value}>{item.title}</Radio.Button>
          ))}
        </Radio.Group>
      </div>
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
            key={svgKey}
            defaultBg={"#101619"}
            selectedStationId={stationId}
            selectedStationCode={stationCode}
            backgroundColor={false}
            filename={svgKey}
          />)
      }
    </Page>
  )
}

function mapPropsToState(model, { }, state) {
  return {
    stationList: state[globalNS].stationList,
  }
}

export default makeConnect('connect-line', mapPropsToState)(FlowEntry)
