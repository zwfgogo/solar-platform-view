import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, FullContainer, RangePicker, Table1, Table2 } from 'wanke-gui'
import classnames from 'classnames'
import FormLayout from '../../../components/FormLayout'
import Page from '../../../components/Page'
import usePageSize from '../../../hooks/usePageSize'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import { isBigThanToday } from '../../../util/dateUtil'
import { storage_run_strategy_log } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RunStrategyLogModel } from '../models/log'
import styles from './strategy-log.less'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import { exportCSV, exportExcel, exportFile } from '../../../util/fileUtil'

const { FieldItem } = FormLayout

interface Props extends PageProps, MakeConnectProps<RunStrategyLogModel>, RunStrategyLogModel {
  stationId: number
  fetchLogListLoading: boolean
  exportLogListLoading: boolean
}

const StrategyLog: React.FC<Props> = (props) => {
  const [timeRange, setTimeRange] = useState<[Moment, Moment]>([moment().startOf('day'), moment().endOf('day')])
  const [pageSize, setPageSize] = usePageSize()

  const fetchList = (page, size) => {
    props.action('fetchLogList', {
      stationId: props.stationId,
      dtime: `${timeRange[0].format('YYYY-MM-DD HH:mm:ss')},${timeRange[1].format('YYYY-MM-DD HH:mm:ss')}`,
      page,
      size,
    })
  }

  const onSearch = () => {
    setPageSize(1, pageSize.size)
  }
  
  useEffect(() => {
    fetchList(pageSize.page, pageSize.size)
  }, [pageSize])
  
  useEffect(() => {
    return () => {
      props.action('reset')
    }
  }, [])

  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 65,
      dataIndex: 'num'
    },
    {
      title: utils.intl('时间'),
      dataIndex: 'dtime',
      width: 180
    },
    {
      title: utils.intl('日志记录'),
      dataIndex: 'log',
      render: (text, record) => (
        <span>【{record.controlMode}】{record.content}</span>
      ),
      renderE: (text, record) => `【${record.controlMode}】${record.content}`
    }
  ]

  const onExport = () => {
    props.action('exportLogList', {
      stationId: props.stationId,
      dtime: `${timeRange[0].format('YYYY-MM-DD HH:mm:ss')},${timeRange[1].format('YYYY-MM-DD HH:mm:ss')}`,
    })
  }

  const handleTimeChange = (val) => {
    setTimeRange(val)
    setTimeout(onSearch)
  }

  return (
    <Page
      clearBgColor
      pageId={props.pageId}
      pageTitle={utils.intl('strategy.策略执行日志')}
      className={styles['strategy-log']}
    >
      <CrumbsPortal pageName="station-strategy-log">
        <Button
          loading={props.exportLogListLoading}
          type="primary"
          onClick={onExport}
          style={{ marginLeft: 16 }}
        >{utils.intl('导出')}</Button>
      </CrumbsPortal>
      <div className={classnames(styles['container'], "page-card-bg", "has-filter-header")}>
        <div className="filter-header" style={{ flexShrink: 0 }}>
          <RangePicker
            showTime
            disabledDate={isBigThanToday}
            allowClear={false}
            value={timeRange}
            onChange={handleTimeChange}
          />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Table2
            loading={props.fetchLogListLoading}
            columns={columns}
            dataSource={props.list}
            page={pageSize.page}
            size={pageSize.size}
            total={props.total}
            onPageChange={setPageSize}
          />
        </div>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    fetchLogListLoading: getLoading('fetchLogList'),
    exportLogListLoading: getLoading('exportLogList'),
  }
}

export default makeConnect(storage_run_strategy_log, mapStateToProps)(StrategyLog)
