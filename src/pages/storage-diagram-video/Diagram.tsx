import React, { useEffect, useState } from 'react'
import { WankeVideoCameraAddOutlined } from 'wanke-icon'
import { FullContainer } from 'wanke-gui'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { DiagramVideo } from './model'
import Page from '../../components/Page'
import { globalNS, storage_diagram_video } from '../constants'
import { makeConnect } from '../umi.helper'

import utils from '../../public/js/utils'
import ConnectLine from '../terminal-station-monitor/system-connect-line/index'

interface Props extends PageProps, MakeConnectProps<DiagramVideo>, DiagramVideo {
  selectedStationId: number
  selectedStationCode: number
}

const Layout: React.FC<Props> = function (this: null, props) {
  const [stationCode, setStationCode] = useState(props.selectedStationCode)

  const toVideo = () => {
    props.forward('video', {})
  }

  const toSingleVideo = () => {
    props.forward('single-video', { url: 'http://39.108.124.91:9028/live?app=myapp&stream=1' })
  }

  useEffect(() => {
    if (props.selectedStationId) {
      props.action('fetchStationDiagram', { stationId: props.selectedStationId })
    }
    return () => {
      props.action('reset')
    }
  }, [props.selectedStationId])

  useEffect(() => {
    setStationCode(null)
    setTimeout(() => {
      setStationCode(props.selectedStationCode)
    }, 10)
  }, [props.selectedStationCode])

  return (
    <Page
      pageId={props.pageId}
      className={'diagram-video-page'}
      showStation={true}
    >
      <FullContainer>
        {props.selectedStationCode !== 1116
          ?
          <div className="pull-right-video">
            <WankeVideoCameraAddOutlined className="pull-right-video-icon" style={{ fontSize: 16, position: 'relative', color: '#000' }} onClick={toVideo} />
          </div>
          : ''
        }
        <div className="flex1 vh-center">
          {
            !props.selectedStationId && (
              <span>{utils.intl('请选择电站')}</span>
            )
          }
          {props.selectedStationId &&
            <div className="svg-container">
              {
                stationCode && (<ConnectLine selectedStationCode={stationCode} filename={'syt'} />)
              }
              {/* <img className="diagram-picture" src={props.diagramUrl} /> */}
            </div>
          }
        </div>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, { }, state) => {
  return {
    ...model,
    selectedStationCode: state[globalNS].selectedStationCode,
    selectedStationId: state[globalNS].selectedStationId
  }
}

export default makeConnect(storage_diagram_video, mapStateToProps)(Layout)
