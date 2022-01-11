import React, {useEffect} from 'react'
import {Pagination, Input, Table1, Table2, Button} from 'wanke-gui'
import {connect} from 'dva'
import classnames from 'classnames'
import {useTable} from '../../../components/useTable'
import CustomDownload, {
  formatExportData
} from '../../../components/CustomDownload'
import styles from './styles/powerStationTable.less'
import {jumpToTerminalSystem} from '../contant'
import {makeConnect} from '../../umi.helper'
import {storage_station_monitor} from '../../constants'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'

export function formatEmptyValue(value: any, defaultStr: string = '') {
  if (value === null || value === undefined || value === '') return defaultStr
  return value
}

export function getStationStatus(code: number | string = '') {
  if (code === null) code = ''
  switch (code.toString()) {
    case '1':
      return 'color-green'
    case '2':
      return 'color-grey'
    case '3':
      return 'color-orange'
    case '4':
      return 'color-blue'
    case '5':
      return 'color-red'
    default:
      return ''
  }
}

export function getRunningStatus(
  workStatus: string = '',
  offLine?: boolean,
  isExport?: boolean
) {
  if (!workStatus) return '-'
  const extraStr = offLine ? '(离线)' : ''
  return isExport ? (
    `${workStatus}${extraStr}`
  ) : (
    <span>
      {workStatus}
      <span style={{color: '#e70d0d'}}>{extraStr}</span>
    </span>
  )
}

interface Props extends MakeConnectProps<{}> {
  size?: number;
  page?: number;
  queryStr?: string;
  totalCount?: number;
  list?: Array<any>;
  tableLoading?: boolean;
  exportTableLoading?: boolean;
  realStationMap?: any;
}

const PowerStationTable: React.FC<Props> = props => {
  const {
    tableLoading,
    exportTableLoading,
    page,
    size,
    queryStr,
    totalCount,
    list,
    realStationMap
  } = props

  useEffect(() => {
    fetchData({page, size, queryStr})
  }, [])

  const fetchData = (params: {
    page: number;
    size: number;
    queryStr: string;
  }) => {
    props.action('getTableData', {
      page: params.page,
      size: params.size,
      queryStr: params.queryStr
    })
  }

  const handleTitleClick = (record) => {
    jumpToTerminalSystem(record.id)
  }

  const {changePage} = useTable({
    page,
    size,
    queryStr,
    fetchData,
    dataSource: list
  })

  const onExport = () => {
    props.action('exportTableData', {queryStr})
  }

  const columns: any = [
    {
      title: '序号',
      dataIndex: 'key',
      width: 65,
      align: 'center'
    },
    {
      title: '电站名称',
      dataIndex: 'title',
      render: (text, record) => <a onClick={() => handleTitleClick(record)}>{text}</a>
    },
    {
      title: '电站类型',
      dataIndex: 'stationType',
      exportFormat: (text, record) => {
        const stationType = record.stationType || {}
        return stationType.title
      },
      render: (text, record) => {
        const stationType = record.stationType || {}
        return <span>{stationType.title}</span>
      }
    },
    {
      title: '电站状态',
      dataIndex: 'stationStatus',
      exportFormat: (text, record) => {
        const stationStatus = record.stationStatus || {}
        return stationStatus.title
      },
      render: (text, record) => {
        const stationStatus = record.stationStatus || {}
        return (
          <span
            className={classnames(
              styles['station-status'],
              styles[getStationStatus(stationStatus.code)]
            )}
          >
            {stationStatus.title}
          </span>
        )
      }
    },
    {
      title: '建设规模',
      dataIndex: 'buildingScale',
      exportFormat: (text, record) =>
        `${formatEmptyValue(record.ratedPowerDisplay)}/${formatEmptyValue(
          record.scaleDisplay
        )}`,
      render: (text, record) => (
        <span>
          <span style={{color: '#009297'}}>
            {formatEmptyValue(record.ratedPowerDisplay)}
          </span>
          /
          <span style={{color: '#3d7eff'}}>
            {formatEmptyValue(record.scaleDisplay)}
          </span>
        </span>
      )
    },
    {
      title: '工作状态',
      dataIndex: 'workStatus',
      exportFormat: (text, record) =>
        `${getRunningStatus(realStationMap?.[record.id]?.['workStatus'], record.offLine, true)}`,
      render: (text, record) => (
        <span>{getRunningStatus(realStationMap?.[record.id]?.['workStatus'], record.offLine, true)}</span>
      )
    },
    {
      title: '实时功率',
      dataIndex: 'power',
      exportFormat: (text, record) => `${formatEmptyValue(realStationMap?.[record.id]?.['activePower'], '-')}`,
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['activePower'], '-')}</span>
    },
    {
      title: '今日充电量',
      dataIndex: 'charge',
      exportFormat: (text, record) => `${formatEmptyValue(realStationMap?.[record.id]?.['charge'], '-')}`,
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['charge'], '-')}</span>
    },
    {
      title: '今日放电量',
      dataIndex: 'discharge',
      exportFormat: (text, record) => `${formatEmptyValue(realStationMap?.[record.id]?.['discharge'], '-')}`,
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['discharge'], '-')}</span>
    }
  ]
console.log(realStationMap)
  return (
    <div className={styles['page-container']}>
      <div style={{textAlign: 'right', marginBottom: 5}}>
        <Button type="primary" onClick={onExport}>导出</Button>
      </div>
      <div className={styles['table-container']}>
        <Table2
          x={500}
          columns={columns}
          dataSource={list}
          loading={tableLoading}
          total={totalCount}
          page={page}
          size={size}
          onPageChange={changePage}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (model, {getLoading}, state) => {
  const {tableData, queryStr, realStationMap} = model

  let results = {
    ...tableData,
    queryStr,
    realStationMap,
    tableLoading: getLoading('getTableData'),
    exportTableLoading: getLoading('exportTableData')
  }
  return results
}

export default makeConnect(storage_station_monitor, mapStateToProps)(PowerStationTable)
