import React from 'react'
import {Table1} from 'wanke-gui'
import {BasicTableProps} from '../../../components/BasicTable'
import {renderTitle} from '../../page.helper'
import {Column} from 'wanke-gui/lib/table'
import utils from '../../../public/js/utils'

interface Props extends BasicTableProps {
  lookStation: (id, record) => void
}

const List8: React.FC<Props> = function (this: null, props) {
  const columns: Column<any>[] = [
    {
      title: utils.intl('电站名称'),
      dataIndex: 'title',
      width: 200,
      key: 'title'
    },
    {
      title: utils.intl('终端用户'),
      dataIndex: 'finalUser',
      key: 'finalUser',
      width: 100,
      render: renderTitle
    },
    {
      title: utils.intl('运维商'),
      dataIndex: 'maintenance',
      key: 'maintenance',
      width: 100,
      render: renderTitle
    },
    {
      title: utils.intl('运营商'),
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: renderTitle
    },
    {
      title: utils.intl('电站类型'),
      dataIndex: 'stationType',
      key: 'stationType',
      width: 110,
      render: renderTitle
    },
    {
      title: utils.intl('建设规模'),
      dataIndex: 'scaleDisplay',
      key: 'scaleDisplay',
      width: 120,
      // align: 'right'
    },
    {
      title: utils.intl('额定功率'),
      dataIndex: 'ratedPowerDisplay',
      key: 'ratedPowerDisplay',
      width: 100,
      // align: 'right'
    },
    {
      title: utils.intl('投产时间'),
      dataIndex: 'productionTime',
      key: 'productionTime',
      width: 130,
      // align: 'center'
    },
    {
      title: utils.intl('电站状态'),
      dataIndex: 'stationStatus',
      key: 'stationStatus',
      width: 110,
      // align: 'center',
      render(value, record) {
        let code = (value && value.code) || ''
        let text = value && value.title
        let backgroundColor = ''
        switch (code.toString()) {
          case '1':
            backgroundColor = '#3a75f8'
            break
          case '2':
            backgroundColor = '#606060'
            break
          case '3':
            backgroundColor = '#ff284b'
            break
          case '4':
            backgroundColor = '#009297'
            break
          case '5':
            backgroundColor = '#ff8328'
            break
        }
        return (
          <div style={{
            display: 'inline-block',
            width: '90px',
            height: '20px',
            backgroundColor: backgroundColor,
            borderRadius: '2px',
            color: '#fff',
            textAlign: 'center'
          }}>
            {text}
          </div>
        )
      }
    },
    {
      width: 120,
      title: utils.intl('状态时间'),
      dataIndex: 'stationStatusTime',
      key: 'stationStatusTime',
    }
  ]

  return <Table1
    x={1220}
    loading={props.loading}
    rowSelection={props.rowSelection}
    dataSource={props.dataSource}
    columns={columns}/>
}

export default List8
