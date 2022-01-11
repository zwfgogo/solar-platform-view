import React, { useState, useEffect, useCallback, useRef } from 'react';
import Page from '../../../components/Page';
import { Row, Col, Button, Input } from 'wanke-gui';
import PageProps from '../../../interfaces/PageProps';
import { makeConnect } from '../../../pages/umi.helper';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import LeftTree from '../components/LeftTree';
import { RealDataQuery } from './model';
import { r_d_q, Tree_Type } from '../../../pages/constants';
import FullLoading from '../../../components/FullLoading';
import Footer from '../../../public/components/Footer';
import utils from '../../../public/js/utils';
import { copy } from '../../../util/utils';
import List from './List';
import SocketHelper from '../../socket.helper'
import { Socket_Port } from '../../../pages/constants'
import { CrumbsPortal } from '../../../frameset/Crumbs';
import { ZdDragOutlined } from 'wanke-icon';
import "./index.less"

const { Search } = Input
const socket = new SocketHelper(r_d_q, Socket_Port, '/station-monitoring')
const socket_dev = new SocketHelper(r_d_q, Socket_Port, '/microgrid-real-data')

interface Props extends PageProps, MakeConnectProps<RealDataQuery>, RealDataQuery {
  treeLoading: boolean;
  listLoading: boolean;
  listSuccess: boolean;
  selectedStationId: number,
  stationList: any[]
}

let startX: number;
let startWidth: number;
let isMousedown: boolean = false

const DataQuery: React.FC<Props> = function (this: null, props) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [mode, setMode] = useState(null);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [treeType, setTreeType] = useState(null);
  const [updateTime, setUpdateTime] = useState('');
  const [leftTreeWidth, setLeftTreeWidth] = useState(250);
  const [selectedItem, setSelectedItem] = useState({})
  const [keyWord, setKeyWord] = useState(null)
  const [deviceTable, setDeviceTable] = useState({ columns: [], dataSource: [] })

  const stationId = props.selectedStationId;
  let treeList: any = copy(props.treeList);
  const oldMapRef = useRef({})
  const LeftTreeDom = useRef()

  if (treeList.length) {
    const target = (props.stationList ?? []).find(item => item.id === props.selectedStationId);
    treeList[0].title = target?.title;
  }

  const refresh = () => {
    // const { deviceId, deviceTypeId } = props.currentSelectNode;
    props.action('fetchPointDataType', { deviceTypeId: props.currentSelectNode?.deviceTypeId, deviceId: props.currentSelectNode?.deviceId });
  }

  useEffect(() => {
    props.action('reset');
    props.action('fetchDeviceTree', { stationId });
    setSelectedKeys([])
  }, [props.selectedStationId])

  useEffect(() => {
    if (!props.dataPointTypeList.length) return;

    const pointDataTypeMap = props.pointDataTypeMap;
    const pointNumberList = [];
    for (const key in pointDataTypeMap) {
      if (pointDataTypeMap[key].pointNumber) {
        pointNumberList.push(pointDataTypeMap[key].pointNumber);
      }
    }
    socket.start(props.dispatch, {}, {
      'connect': () => {
        const target = (props.stationList ?? []).find(item => item.id === props.selectedStationId);
        socket.emit('realDataQuery', { pointNumbers: pointNumberList.join(','), timeZone: target?.timeZone ?? 'Asia/Shanghai' })
      },
      'realDataQuery': (message) => {
        const { results } = message;
        const { analogData, updateTime } = results;
        setUpdateTime(updateTime);
        const valueMap = { ...oldMapRef.current, ...analogData }
        oldMapRef.current = valueMap
        props.updateState({ valueMap });
      },
      // 'real_data': (message) => {
      //   const { columns, dataSource } = message
      //   setDeviceTable({ columns, dataSource })
      // }
    })
    return () => {
      socket.close();
    }
  }, [JSON.stringify(props.pointDataTypeMap)])

  useEffect(() => {
    socket_dev.start(props.dispatch, {}, {
      'connect': () => {
        // const target = (props.stationList ?? []).find(item => item.id === props.selectedStationId);
        // socket.emit('realDataQuery', { pointNumbers: pointNumberList.join(','), timeZone: target?.timeZone ?? 'Asia/Shanghai' })
      },
      'real-data-query': (message) => {
        const { columns, dataSource } = message
        setDeviceTable({ columns, dataSource })
      }
    })


    document.body.addEventListener('mousemove', (e) => {
      if (isMousedown) {
        setLeftTreeWidth(Math.min(Math.max(startWidth + e.clientX - startX, 12), 500))
      }
    })
    document.body.addEventListener('mouseup', () => {
      isMousedown = false
    })
  }, []);

  // 设备树节点点击选中事件
  const onFinishSelected = (selectedItem) => {
    setSelectedItem(selectedItem)
    if (selectedItem.type === Tree_Type.virtualNode) {
      setDeviceTable({ columns: [], dataSource: [] })
      socket_dev.emit('getPointVal', { deviceList: selectedItem.children, type: selectedItem.name }) // 设备类型
    }
  }

  // 根据关键字过滤
  const filterTableList = (tableList, keyWords) => {
    if (keyWords && keyWords !== '' && tableList?.length) {
      return tableList.filter(item => item.title.indexOf(keyWords) > -1)
    } else {
      return tableList
    }
  }

  // 添加表头翻译
  const columnsTranslate = (columns) => {
    if (columns && columns.length) {
      return columns.map(item => {
        const { children } = item
        if (children && children.length) {
          return { ...item, title: utils.intl(item.title), children: columnsTranslate(children) }
        }

        return { ...item, title: utils.intl(item.title) }
      })
    }
    return []
  }

  return (
    <Page
      showStation={true}
      pageId={props.pageId}
      className={'energy-unit-page'}
      style={{ display: 'flex', background: "transparent", boxShadow: "none" }}
    >
      <CrumbsPortal>
        {
          selectedItem.type === Tree_Type.virtualNode ?
            null
            :
            (<>
              <span style={{ marginRight: 16 }}>{utils.intl('最后更新时间')}：{updateTime}</span>
              <Button onClick={refresh} type="default">
                {utils.intl('刷新')}
              </Button></>)
        }
      </CrumbsPortal>
      <div className="left page-sub-left" ref={LeftTreeDom} style={{ flexShrink: 0, width: leftTreeWidth, marginRight: 16 }}>
        <div className="flex1 f-oa e-pt20 e-pl20 e-pr20 horizontal-scroll-tree" style={{ position: 'relative' }}>
          {
            props.treeLoading && (<FullLoading />)
          }
          <LeftTree
            setSelectedKeys={setSelectedKeys}
            setMode={setMode}
            setCheckedKeys={setCheckedKeys}
            setTreeType={setTreeType}
            treeList={treeList}
            selectedKeys={selectedKeys}
            checkedKeys={checkedKeys}
            editable={false}
            action={props.action}
            onFinishSelected={onFinishSelected}
          />
        </div>
        <div
          className="dragBox"
          onMouseDown={e => {
            startX = e.clientX
            const { width } = LeftTreeDom.current.getBoundingClientRect()
            startWidth = width
            isMousedown = true
          }}
        >
          <ZdDragOutlined style={{ color: '#999' }} />
        </div>
      </div>
      <div className="right page-sub-right page-no-padding" style={{ overflow: 'hidden', marginLeft: 0 }}>
        <div
          className="flex1 f-pr"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div className="table-header">
            {
              selectedItem.type === Tree_Type.virtualNode ? <div className="table-title">{selectedItem.title}{utils.intl('real.数据')}</div> : <Search style={{ width: 260 }} placeholder={utils.intl('请输入关键字查询')} onSearch={value => setKeyWord(value)} />
            }
          </div>
          <section className="table-box" style={{ overflow: 'hidden', height: 'calc(100% - 50px)' }}>
            {
              selectedItem.type === Tree_Type.virtualNode ?
                <List
                  dataSource={deviceTable?.dataSource}
                  loading={props.listLoading}
                  valueMap={props.valueMap}
                  columns={columnsTranslate(deviceTable?.columns)}
                  pointDataTypeMap={props.pointDataTypeMap}
                /> :
                <List
                  dataSource={filterTableList(props.dataPointTypeList, keyWord)}
                  loading={props.listLoading}
                  valueMap={props.valueMap}
                  // columns={selectedItem.type === Tree_Type.virtualNode ? columnsTranslate(deviceTable?.columns) : undefined}
                  pointDataTypeMap={props.pointDataTypeMap}
                />
            }
          </section>
        </div>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationList: state.global.stationList,
    treeLoading: getLoading('fetchDeviceTree'),
    listLoading: getLoading('fetchPointDataType'),
    listSuccess: isSuccess('fetchPointDataType')
  }
}

export default makeConnect(r_d_q, mapStateToProps)(DataQuery)