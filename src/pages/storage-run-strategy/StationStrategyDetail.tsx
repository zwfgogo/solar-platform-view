import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { Button, FullContainer, Input, message, Tabs } from 'wanke-gui'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { RunStrategyModel } from './models/data'
import Page from '../../components/Page'
import { storage_run_strategy } from '../constants'
import { makeConnect } from '../umi.helper'
import usePageSize from '../../hooks/usePageSize'
import List2 from './item/List2'

import utils from '../../public/js/utils'
import TrackingChart from './tracking-chart/TrackingChart'
import { TrackingChartType } from './strategy.constant'

enum BoardType {
  tracking = "tracking",
  list = "list",
}

interface Props extends PageProps, MakeConnectProps<RunStrategyModel>, RunStrategyModel {
  stationId: number
  stationName: string
  sendSuccess: boolean
  fetchStrategyListLoading: boolean
}

const StationStrategyDetail: React.FC<Props> = function (this: null, props) {
  const { strategyList, strategyCount } = props
  const [activeKey, setActiveKey] = useState(BoardType.tracking)

  const toLook = (index) => {
    const record = strategyList[index]
    switch(record.name) {
      case TrackingChartType.C01:
        props.forward('pick-shaving', {
          stationId: props.stationId,
          strategyId: strategyList[index].id,
          strategyStatus: record.strategyStatus,
        })
        break
      case TrackingChartType.C05:
      case TrackingChartType.C06:
      case TrackingChartType.C07:
      case TrackingChartType.C19:
        props.forward('strategy-info', {
          type: record.name,
          stationId: props.stationId,
          runStrategyId: strategyList[index].id,
        })
        break
      default:
        return null
    }
  }

  const toLog = () => {
    props.forward('station-strategy-log', {
      stationId: props.stationId,
    })
  }

  const toStart = (index) => {
    props.action('send', { id: strategyList[index].id, stationId: props.stationId, mode: 'start' })
  }

  const toStop = (index) => {
    props.action('send', { id: strategyList[index].id, stationId: props.stationId, mode: 'stop' })
  }

  const fetchStrategyList = () => {
    props.action('fetchStrategyList', {
      stationId: props.stationId,
    })
  }

  useEffect(() => {
    fetchStrategyList()
    return () => {
      props.action('clearDetail')
    }
  }, [])

  useEffect(() => {
    if (props.sendSuccess) {
      message.success(utils.intl('操作成功'))
      fetchStrategyList()
    }
  }, [props.sendSuccess])

  useEffect(() => {
  }, [activeKey])

  return (
    <Page
      clearBgColor
      pageId={props.pageId}
      pageTitle={props.stationName}
      className={'run-strategy-page'}
    >
      <FullContainer className="page-card-bg" style={activeKey === BoardType.tracking ? { height: 560 } : {}}>
        <div className="h-space">
          <Tabs activeKey={activeKey} onChange={val => setActiveKey(val as BoardType)} style={{ width: '100%' }}>
            <Tabs.TabPane key={BoardType.tracking} tab={utils.intl('strategy.当前策略')}></Tabs.TabPane>
            <Tabs.TabPane key={BoardType.list} tab={utils.intl('strategy.策略查询')}></Tabs.TabPane>
          </Tabs>
        </div>
        <div className="flex1" style={{ padding: '0 16px 16px 16px' }}>
          {activeKey === BoardType.tracking && (
            <TrackingChart stationId={props.stationId} toLog={toLog} />
          )}
          {activeKey === BoardType.list && (
            <List2
              loading={props.fetchStrategyListLoading}
              dataSource={strategyList}
              total={strategyCount}
              toLook={toLook}
              toStart={toStart}
              toStop={toStop}
            />
          )}
        </div>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    sendSuccess: isSuccess('send'),
    fetchStrategyListLoading: getLoading('fetchStrategyList'),
  }
}

export default makeConnect(storage_run_strategy, mapStateToProps)(StationStrategyDetail)
