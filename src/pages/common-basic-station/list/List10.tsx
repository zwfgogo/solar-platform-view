import React from 'react'
import Status from './Status'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import Forward from '../../../public/components/Forward'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import TimeZoneMap from '../../../components/time-zone-picker/locale/time-zone-map.json';
import { Mode } from '../../constants'
import { Checkbox, Table2 } from 'wanke-gui'
import utils from '../../../public/js/utils'
import { isBatterySystem } from '../../../core/env'

//最外层页面表格
interface Props extends PageTableProps, ActionProp {
  stationStatusOptions: any[]
  energyUnitStatusOptions: any[]
  stationStatusMap: any
  roleName: string
  firm: any
  lookStation: (id: number) => void
  handleStatusChange: (id, v) => void
  handlePlatformChange?: (id, v) => void
}

let language: any = localStorage.getItem('language');
let _TimeZoneMap = {};
for (let key in TimeZoneMap[language]) {
  _TimeZoneMap[TimeZoneMap[language][key]] = key
}

const List10: React.FC<Props> = function (this: null, props) {
  const firmTypeName = JSON.parse(sessionStorage.getItem('userInfo'))?.firm?.firmType?.name
  let isOperator: any = firmTypeName === 'Operator';
  const isPlatform = firmTypeName === 'Platform'
  let columns: any = [{
    title: utils.intl('序号'),
    dataIndex: 'num',
    width: 65,
  }]
  if (isBatterySystem() && (props.roleName === 'Admin' || props.roleName === 'admin') && isPlatform) {
    columns.push({
      title: utils.intl('station.电池健康平台'),
      dataIndex: 'hasBatteryHealthPlatform',
      width: 130,
      align: 'center',
      render: (text, record) => (
        <Checkbox
          checked={!!text}
          onChange={(e) => props.handlePlatformChange?.(record.id, e.target.checked)}
        />
      )
    })
  }
  columns = columns.concat([
    {
      title: utils.intl('电站名称'),
      dataIndex: 'title',
      render: (text, record) => {
        return (
          <AbsoluteBubble>
            <Forward to="stationUpdate"
              data={{ stationRecord: record, energyUnitStatusOptions: props.energyUnitStatusOptions, stationStatusOptions: props.stationStatusOptions, mode: Mode.look, stationId: record.id }}
              title={record.title}>
              {text}
            </Forward>
          </AbsoluteBubble>
        )
      }
    },
    {
      title: utils.intl('所处时区'),
      dataIndex: 'timeZone',
      width: 300,
      render: (text) => {
        return <AbsoluteBubble>{_TimeZoneMap[text] ?? text}</AbsoluteBubble>
      }
    },
    {
      title: isOperator ? '' : utils.intl('运营商'),
      dataIndex: 'operator',
      width: isOperator ? 0 : 180,
      render: (value) => {
        return <AbsoluteBubble>{value && value.title}</AbsoluteBubble>
      }
    },
    // {
    //   title: utils.intl('运维商'),
    //   dataIndex: 'maintenance',
    //   width: 100,
    //   render: (value) => {
    //     return <AbsoluteBubble>{value && value.title}</AbsoluteBubble>
    //   }
    // },
    // {
    //   title: utils.intl('终端用户'),
    //   dataIndex: 'finalUser',
    //   width: 100,
    //   render: (value) => {
    //     return <AbsoluteBubble>{value && value.title}</AbsoluteBubble>
    //   }
    // },
    {
      title: utils.intl('电站类型'),
      dataIndex: 'stationType',
      width: 130,
      render: (value) => {
        return value && value.title
      }
    },
    {
      title: utils.intl('额定功率'),
      dataIndex: 'ratedPowerDisplay',
      width: 120,
      render: (value) => {
        return <AbsoluteBubble>{value}</AbsoluteBubble>
      }
    },
    // {
    //   title: utils.intl('建设规模'),
    //   dataIndex: 'scaleDisplay',
    //   width: 120,
    //   render: (value) => {
    //     return <AbsoluteBubble>{value}</AbsoluteBubble>
    //   }
    // },
    {
      title: utils.intl('投产时间'),
      dataIndex: 'productionTime',
    },
    // {
    //   title: utils.intl('货币单位'),
    //   dataIndex: 'currency',
    //   width: 80,
    // },
    {
      title: utils.intl('电价信息'),
      dataIndex: 'priceId',
      width: 120,
      render: (text, record) => {
        if (record.hasPrice) {
          return <a onClick={() => props.lookStation(record)}>{utils.intl("查看")}</a>;
        }
        return <div style={{ color: 'red' }}>{utils.intl("暂无")}</div>
      }
    },
    {
      title: utils.intl('电站状态'),
      width: 160,
      dataIndex: 'stationStatusTitle',
      render: (text, record) => {
        // let code = null
        let id, title, name, backgroundColor = '#000'
        if (record.stationStatus) {
          id = record.stationStatus.id
          title = record.stationStatus.title
          name = record.stationStatus.name
        }
        switch (name) {
          case 'constructing':
            backgroundColor = 'rgba(187,184,193,0.45)';
            break;
          case 'activate':
            backgroundColor = 'rgba(82,196,26,0.85)';
            break;
          case 'testing':
            backgroundColor = 'rgba(250,173,20,0.85)';
            break;
          case 'deactivated':
            backgroundColor = 'rgba(245,34,45,0.85)';
            break;
          default:
            backgroundColor = '#000';
            break;
        }
        // let match = props.stationStatusOptions.find(o => o.value === id)
        // const options = props.stationStatusMap[id]?.options || []
        // if (match) {
        //   code = match.code
        // }
        return (
          <div>
            <div style={{ marginRight: 6, width: 10, height: 10, backgroundColor, borderRadius: '99px', display: 'inline-block' }}></div>
            {title}
          </div>
        );
        // return (
        //   <Status
        //     disabled={!record.stationStatusUpdate || options.length <= 1}
        //     options={options}
        //     current={id}
        //     onChange={v => props.handleStatusChange(record.id, v)}
        //     code={code}
        //     stationStatusOptions={props.stationStatusOptions}
        //   >
        //     {title}
        //   </Status>
        // );
      }
    },
    // {
    //   title: utils.intl('状态时间'),
    //   dataIndex: 'stationStatusTime',
    //   width: 140,
    //   render: (text, record) => (
    //     <Forward to="stationStatus" data={{ stationId: record.id }}>
    //       {text}
    //     </Forward>
    //   )
    // }
  ]);

  return (
    <Table2
      x={1350}
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
};

export default List10
