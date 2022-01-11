/**
 * 重构历史数据查询
 */
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import FullLoading from 'wanke-gui/lib/full-loading'
import { DownOutlined, UpOutlined, ZdDragOutlined } from 'wanke-icon'
import { Tree, AutoSizer, Checkbox, Row, Col, message, RangePicker, Button, MultiLineChart, LineChart, Spin, Input } from 'wanke-gui'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { accuracyEnum, h_d_q, Tree_Type } from '../constants'
import { makeConnect } from '../umi.helper'
import { HistoryDataNewState, modelKey } from './model'
import "./index.less"
import createServices from '../../util/createServices'
import utils from '../../public/js/utils'
import Item from '../../components/SelectItem'
import { getSystemTime, isBigThanToday } from '../../util/dateUtil'
import moment from 'moment'
import DetailModal from '../common-history-data-query/components/DetailModal'
import { exportFile } from '../../util/fileUtil'
import TagList from './components/TagList'
import { triggerEvent } from '../../util/utils'
import classNames from 'classnames'
import _ from 'lodash'
import { overflow } from 'html2canvas/dist/types/css/property-descriptors/overflow'

const { Search } = Input

interface Props extends PageProps, MakeConnectProps<HistoryDataNewState>, HistoryDataNewState {
  selectedStationId: number | string,
  stationDetail: any,
  stationList: any[],
  treeLoading: boolean,
  listLoading: boolean,
  chartDataLoading: boolean;
}

let startX: number;
let startWidth: number;
let isMousedown: boolean = false
const MAX_DATA_LEN = 8;
const MAX_UNIT_LEN = 2;

const HistoryDataQuery: React.FC<Props> = (props) => {

  const [leftTreeWidth, setLeftTreeWidth] = useState(250);
  const [disabled, setDisabled] = useState(false)
  const [treeList, setTreeList] = useState(props.treeList)
  const [checkboxDisplay, setCheckboxDisplay] = useState(false);
  // const [pointNumbers, setPointNumbers] = useState([])
  const [treeName, setTreeName] = useState([]) // 记录当前树节点的name
  const [unitMap, setUnitMap] = useState({}); // 当前已选的单位与点号枚举集合
  const [dateValue, setDateValue] = useState([moment(), moment()])
  const [modalVisible, setModalVisible] = useState(false);
  const [selectKeys, setSelectKeys] = useState([]); // tree选中的key数组
  const [expandedKeys, setExpandedKeys] = useState(undefined);
  const [tagDataSource, setTagDataSource] = useState([]);
  const [isExpand, setIsExpand] = useState(false);
  const [rightOverFlow, setRightOverFlow] = useState('hidden');
  const [searchValue, setSearchValue] = useState(undefined);
  const [checkGroup, setCheckGroup] = useState({});
  const [expandKey, setExpandKey] = useState(null)

  const LeftTreeDom = useRef();
  const RightCheckBoxDom = useRef();
  const treeRef = useRef();

  useEffect(() => {
    document.body.addEventListener('mousemove', stopMouseMove)
    document.body.addEventListener('mouseup', stopMouseUp)
    window.addEventListener('click', handleClickDocument)
    return () => {
      window.removeEventListener('click', handleClickDocument)
      document.body.removeEventListener('mouseup', stopMouseUp)
      document.body.removeEventListener('mousemove', stopMouseMove)
      startX = undefined;
      startWidth = undefined;
      isMousedown = false;
    }
  }, []);

  useEffect(() => {
    if (searchValue) {
      setCheckGroup(_.groupBy(props.checkBoxOptions.filter(item => (item.label ?? '').indexOf(searchValue) > -1), "terminalTitle"))
    } else {
      setCheckGroup(_.groupBy(props.checkBoxOptions, "terminalTitle"))
    }
  }, [JSON.stringify(props.checkBoxOptions), searchValue])

  const stopMouseUp = () => {
    isMousedown = false
    // window.event.stopPropagation();
  }

  const stopMouseMove = (e) => {
    if (isMousedown) {
      setLeftTreeWidth(Math.min(Math.max(startWidth + e.clientX - startX, 12), 500))
      setTimeout(() => {
        triggerEvent('resize', window)
      }, 500)
    }
  }

  const handleClickDocument = (e) => {
    setCheckboxDisplay(false)
  }

  useEffect(() => {
    props.action('fetchDeviceTree', { stationId: props.selectedStationId });
    // 初始化
    setUnitMap({});
    setSelectKeys([]);
    setTagDataSource([]);
  }, [props.selectedStationId])

  useEffect(() => {
    setTreeList(props.treeList)
  }, [JSON.stringify(props.treeList)])

  // 查询
  useEffect(() => {
    props.action('fetchChartData', { unitMap, date: dateValue });
  }, [JSON.stringify(unitMap), JSON.stringify(dateValue)])

  useEffect(() => {
    setExpandedKeys(props.defaultExpandedKeys);
  }, [JSON.stringify(props.defaultExpandedKeys)])

  useEffect(() => {
    setTimeout(() => {
      triggerEvent('resize', window)
    }, 200)
  }, [expandKey])

  useEffect(() => {
    setTimeout(() => {
      triggerEvent('resize', window)
    }, 500)
  }, [JSON.stringify(props.checkBoxOptions)])

  const handleChange = useCallback(
    (value) => {
      const { checkBoxOptions } = props
      // 单位判断
      const notUnits = checkBoxOptions.filter(i => value.indexOf(i.value) < 0).map(i => i.value)
      const nameList = tagDataSource.find(item => item.value === selectKeys[0]).name.split('/');
      const units = checkBoxOptions
        .filter(i => value.indexOf(i.value) >= 0)
        .reduce((vPre, vItem) => {
          return {
            ...vPre,
            [vItem.value]: { 
              id: vItem.id,
              name: vItem.unit,
              title: vItem.unit,
              accuracy: accuracyEnum[vItem.accuracy] ?? 2,
              treeName: `${nameList[0]}-${nameList[nameList.length - 1]}-${vItem.label}${vItem.terminalTitle ? `（${vItem.terminalTitle}）` : ''}` }
          }
        }, _.omitBy(unitMap, (value, key) => notUnits.indexOf(key) >= 0));
        // console.log('units', units)
      const unitList = Array.from(new Set(
        Object.values(units)
          .reduce(
            (pre: any[], unit: any) => { return [...pre, unit?.name ?? ''] as any[] },
            []) as any[]
      ))

      if (unitList.length > MAX_UNIT_LEN) {
        message.warn(utils.intl('数据项单位不能超过2类'));
        return
      }

      const newPointNumbers = Object.keys(units)

      if (newPointNumbers.length > MAX_DATA_LEN) {
        message.warn(utils.intl('显示曲线数据时曲线总数不大于8条'));
        return

      }
      setUnitMap(units);

      setTagDataSource(tagDataSource.filter(item => value.length ? true : (item.extraNumber !== 0 && item.value !== selectKeys[0]) || item.value === selectKeys[0]).map(item => {
        if (item.value === selectKeys[0]) {
          item.extraNumber = value.length
          item.pointNumbers = value.join()
        }
        return item
      }))
    },
    [JSON.stringify(props.checkBoxOptions), JSON.stringify(unitMap), treeName, JSON.stringify(selectKeys), JSON.stringify(tagDataSource)],
  )

  const { chartData } = props
  const LineChartProps = useMemo(() => {
    const { chartData } = props
    return {
      series: (chartData.series || []).filter(item => item.name !== 'undefined'),
      xData: chartData.xData || [],
      yData: chartData.yData || [],
      options: {
        backOpacity: [0, 0],
        startDate: dateValue[0].startOf('day').valueOf(),
        endDate: dateValue[1].endOf('day').valueOf(),
        dateFormat: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
        tooltipDateFormat: 'YYYY-MM-DD HH:mm:ss',
        margin: { left: 70 },
        yAxisScale: true,
      }
    }
  }, [JSON.stringify(props.chartData), dateValue.map(i => i.format("YYYY-MM-DD")).join()])

  const { columns, listData } = useMemo(() => {
    let columns: any = [{
      title: utils.intl('序号'),
      width: 65,
      dataIndex: 'num'
    }, {
      title: utils.intl('数据时间'),
      dataIndex: 'time',
    }];
    const chartData = _.cloneDeep(props.chartData);
    for (const item of chartData.series) {
      columns.push({
        title: item.name,
        dataIndex: item.name,
        ellipsis: true,
      });
    }
    const listData = [];
    for (let j = 0, len = chartData.xData.length; j < len; j++) {
      listData.push({
        num: j + 1,
        time: chartData.xData[j],
      });
      for (let i = 0, subLen = chartData.series.length; i < subLen; i++) {
        listData[j][chartData.series[i].name] = chartData.yData[i][j] !== null && typeof (chartData.yData[i][j]) !== 'undefined' && chartData.yData[i][j] !== 'ph' && chartData.yData[i][j].value !== 'ph'
          ? `${chartData.yData[i][j].value}${chartData.series[i].unit ?? ''}`
          : '';
      }
    }
    return { columns, listData }
  }, [JSON.stringify(props.chartData)])

  const handlerTree = (treeList => {
    if (!treeList || !treeList.length) {
      return [];
    }

    return treeList.map(item => {
      const leaf = { ...item };
      // const leaf = _.cloneDeep(item);
      if (leaf.activity === false && leaf.type !== Tree_Type.virtualNode) {
        leaf.title = leaf.title + `(${utils.intl('无效')})`;
      }

      // 是否可勾选
      let checkable = false;
      // 可编辑状态下
      let editable = props.editable;

      if (editable) {
        if (leaf.type == Tree_Type.singleBattery) {
          checkable = true;
        } else if (leaf.type === Tree_Type.batteryGroup) {
          // 电池组类型
          if (leaf.children && leaf.children.length && leaf.children[0].type === Tree_Type.singleBattery) {
            checkable = true;
            leaf.hasChild = true;
          }
        } else if (leaf.type === Tree_Type.batteryPackage && leaf.children && leaf.children.length) {
          // 电池包
          checkable = true;
          leaf.hasChild = true;
        }
      }

      leaf.checkable = checkable;
      leaf.selectable = leaf.type !== Tree_Type.station && leaf.type !== Tree_Type.energyUnit
      leaf.isLeaf = !leaf.hasChild && !leaf?.children?.length || leaf.type == Tree_Type.singleBattery

      if (leaf.children) {
        leaf.children = handlerTree(leaf.children);
      }

      return leaf;
    });
  })

  // tree选择
  const handleTreeSelect = (keys, e) => {
    // console.log('e', e, keys);
    const { node } = e
    const flag = checkboxDisplay ? !!keys.length : true
    setCheckboxDisplay(flag)
    const pLen = tagDataSource.reduce((pre, i) => pre + i.extraNumber, 0);
    if (pLen >= MAX_DATA_LEN && !tagDataSource.find(item => item.value === keys[0])) {
      message.warn(utils.intl('显示曲线数据时曲线总数不大于8条'));
      return
    }

    if (keys[0]) {
      const treeName = getTreeName(treeList, keys[0]?.split('-') ?? [])
      setTreeName(treeName)
      setSelectKeys(keys)
      const names = getTagDataSourceName(keys[0]).filter((_, index) => index > 0);
      if (tagDataSource.findIndex(i => i.value === keys[0]) < 0) {
        const newTagDataSource = [...tagDataSource.filter(i => i.extraNumber !== 0), { value: keys[0], name: names.join('/'), extraNumber: 0, node }];
        setTagDataSource(newTagDataSource);
      }

    }
    props.action('fetchPointDataType', { deviceTypeId: node.typeId, deviceId: node.id, deviceTitle: node.title })
  }

  const pointNumbers = useMemo(() => {
    return Object.keys(unitMap)
  }, [JSON.stringify(unitMap)])

  const exportCsv = () => {
    const station = props.stationList.find(item => item.id === props.selectedStationId)
    exportFile(columns, listData, null, {
      filename: `${station?.title} ${(moment(getSystemTime())).format("YYYY-MM-DD HH_mm_ss")}`
    });
  }

  const getTagDataSourceName = useCallback(
    (keys, list) => {
      const treeList = list || props.treeList
      const trueObj = treeList.find(item => keys === item.key);
      if (trueObj) {
        return [trueObj.title];
      } else {
        const obj = treeList.find(item => keys.indexOf(item.key) === 0);
        if (obj) {
          return [obj.title, ...getTagDataSourceName(keys, obj.children)];
        }
        return [];
      }
    },
    [JSON.stringify(props.treeList)],
  )

  // 点击
  const tagClick = (item) => {
    const { node, value } = item
    setSelectKeys([value]);
    const newExpandedKeys = value.split('-').reduce((pre, i) => [...pre, `${pre.length === 0 ? i : `${pre[pre.length - 1]}-${i}`}`], []);
    setExpandedKeys([...expandedKeys, ...newExpandedKeys]);
    // console.log('treeRef.current', treeRef.current.treeRef.current)
    treeRef.current.treeRef.current.scrollTo({ key: value })
    if (selectKeys[0] !== value) { // 查询点号数据类型  
      props.action('fetchPointDataType', { deviceTypeId: node.typeId, deviceId: node.id, deviceTitle: node.title })
    }
  }

  // 删除
  const tagClose = (item) => {
    const newTagDataSource = tagDataSource.filter(i => i.value !== item.value)
    setTagDataSource(newTagDataSource);
    // 删除对应的曲线
    const newUnits = _.omitBy(unitMap, (value, key) => item.pointNumbers.indexOf(key) > -1);
    setUnitMap(newUnits)
    if (newTagDataSource.length > 0) {
      const { value, node } = newTagDataSource[0];
      setSelectKeys([value]);
      const newExpandedKeys = value.split('-').reduce((pre, i) => [...pre, `${pre.length === 0 ? i : `${pre[pre.length - 1]}-${i}`}`], []);
      setExpandedKeys([...expandedKeys, ...newExpandedKeys]);
      treeRef.current.treeRef.current.scrollTo({ key: value })
      props.action('fetchPointDataType', { deviceTypeId: node.typeId, deviceId: node.id, deviceTitle: node.title });
    } else {
      props.action('updateState', { checkBoxOptions: [] });
      setSelectKeys([]);
    }
  }

  // console.log('props.checkBoxOptions', JSON.stringify(props.checkBoxOptions))

  return (
    <Page
      showStation
      pageId={props.pageId}
      className={'energy-unit-page'}
      style={{ display: 'flex', background: "transparent", boxShadow: "none" }}>
      <div className="left page-sub-left" ref={LeftTreeDom} style={{ flexShrink: 0, width: leftTreeWidth }}>
        <div className="flex1 f-oa e-pt20 e-pl20 e-pr20 horizontal-scroll-tree" style={{ position: 'relative' }}>
          {
            props.treeLoading && (<FullLoading />)
          }
          <AutoSizer>
            {
              ({ width, height }) => {
                const newTreeList = handlerTree(treeList)
                if (height === 0 || newTreeList?.length === 0) return null
                return (<Tree
                  ref={treeRef}
                  filterable
                  scrollX
                  showIcon
                  showLine
                  height={height}
                  checkable
                  treeData={newTreeList}
                  // defaultExpandedKeys={props.defaultExpandedKeys}
                  expandedKeys={expandedKeys}
                  onExpand={expandedKeys => setExpandedKeys(expandedKeys)}
                  onClick={e => e.stopPropagation()}
                  onSelect={handleTreeSelect}
                  selectedKeys={selectKeys}
                  searchProps={{
                    placeholder: utils.intl('请输入关键字搜索')
                  }}
                  loadData={(node) =>
                    new Promise<void>(resolve => {
                      const { key, id, children, hasChild } = node
                      setDisabled(true);
                      if (children && children.length || !hasChild) {
                        setDisabled(false);
                        resolve();
                        return;
                      } else if (hasChild) {
                        createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id, activity: true })
                          .then(data => {
                            setTreeList(tList => updateTreeData(tList, key, data?.results || []))
                            setDisabled(false);
                            resolve();
                          })
                      }
                    })}
                />)
              }
            }
          </AutoSizer>
          {/* <LeftTree
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
          /> */}
        </div>
        <div
          className="dragBox"
          onMouseDown={e => {
            startX = e.clientX
            const { width } = LeftTreeDom.current.getBoundingClientRect()
            startWidth = width
            isMousedown = true
          }}
          onClick={e => e.stopPropagation()}
        >
          <ZdDragOutlined style={{ color: '#999' }} />
        </div>
      </div>
      {/* {
        checkboxDisplay && (
          <div className="data-type-list" style={{ left: leftTreeWidth }} onClick={e => e.stopPropagation()}>
            {props.listLoading && <FullLoading></FullLoading>}
            <Checkbox.Group
              style={{ overflowX: 'hidden', width: '100%' }}
              options={(props.checkBoxOptions ?? []).map(i => ({ ...i, label: <span title={i.label}>{i.label}</span> }))}
              value={pointNumbers}
              onChange={handleChange}
            >
            </Checkbox.Group>
          </div>
        )
      } */}
      <div className="right" style={{ overflow: 'hidden', marginLeft: 0, display: 'flex', flexDirection: "column" }}>
        <div className="page-sub-right" style={{ marginBottom: 16, padding: 0, maxHeight: 350, minHeight: 120, flex: "0 0 auto" }}>
          <div className="page-sub-right-header" style={{ display: "flex" }}>
            {utils.intl('当前选中')}:
            <TagList
              style={{ flex: 1 }}
              dataSource={tagDataSource}
              onClick={tagClick}
              onClose={tagClose}
            />
          </div>
          <div className="page-sub-right-body" style={{ overflowY: 'auto' }} ref={RightCheckBoxDom}>
            <div className="checkbox-box">
              <Search
                placeholder={utils.intl('请输入关键字')}
                value={searchValue}
                style={{ width: 250, marginLeft: 16 }}
                onSearch={value => {
                  setSearchValue(value);
                }}
              />
              {
                props.listLoading ?
                  <Spin />
                  :
                  tagDataSource && tagDataSource.length > 0 ? (
                    <Checkbox.Group
                      style={{ overflowX: 'hidden', width: '100%' }}
                      // options={(props.checkBoxOptions ?? []).map(i => ({ ...i, label: <span title={i.label} className="checkbox-title">{i.label}</span> }))}
                      value={pointNumbers}
                      onChange={handleChange}
                    >
                      {
                        Object.keys(checkGroup).map((key, index) => <div className="checkbox-terminalTitle-box">
                          { key !== 'null' ? <div className="checkbox-terminalTitle">{key}</div> : null }
                          <div className="checkbox-item-box" style={{
                            height: "auto",
                            maxHeight: expandKey === key ? 163 : 35,
                            overflowY: expandKey === key ? 'auto' : 'hidden',
                          }}>
                            {
                              checkGroup[key].map(item => (
                                <Checkbox value={item.value} disabled={item.disabled}>{item.label}</Checkbox>
                              ))
                            }
                          </div>
                          <div className="page-more-text" onClick={() => {
                            setExpandKey(expandKey === key ? null : key)
                            if(expandKey === key){

                            }
                            // setIsExpand(!isExpand);
                            // if (isExpand) {
                            //   setRightOverFlow('hidden');
                            //   RightCheckBoxDom.current.scrollTop = 0;
                            // }
                          }}>
                            {
                              expandKey === key ? (
                                <>
                                  {utils.intl('收起')}
                                  <UpOutlined style={{ marginLeft: 4 }} />
                                </>
                              )
                                :
                                (
                                  <>
                                    {utils.intl('更多')}
                                    <DownOutlined style={{ marginLeft: 4 }} />
                                  </>
                                )
                            }
                          </div>
                        </div>)
                      }
                    </Checkbox.Group>
                  ) : null
              }
            </div>
            {/* <div className="page-more">
              <div className="page-more-text" onClick={() => {
                setIsExpand(!isExpand);
                if (isExpand) {
                  setRightOverFlow('hidden');
                  RightCheckBoxDom.current.scrollTop = 0;
                }
              }}>
                {
                  isExpand ? (
                    <>
                      {utils.intl('收起')}
                      <UpOutlined style={{ marginLeft: 4 }} />
                    </>
                  )
                    :
                    (
                      <>
                        {utils.intl('更多')}
                        <DownOutlined style={{ marginLeft: 4 }} />
                      </>
                    )
                }
              </div>
            </div> */}
          </div>
        </div>
        <div className="page-sub-right" style={{ flex: 1 }}>
          <div className="form-filter">
            <div>
              <span>{utils.intl('时间1')}：</span>
              <RangePicker
                style={{ marginRight: 20 }}
                disabledDate={isBigThanToday}
                allowClear={false}
                maxLength={7}
                value={dateValue}
                onChange={value => setDateValue(value)}
              />
            </div>
            <Button
              onClick={() => setModalVisible(true)}
              disabled={pointNumbers.length === 0}
            >{utils.intl('查看数据表')}</Button>
          </div>
          <div style={{ display: 'flex', flexGrow: 1, position: 'relative', height: 'calc(100% - 48px)' }}>
            <div className="history-query-chart" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {
                props.chartDataLoading ? <Spin /> :
                props.chartData?.series?.length ? (
                  <MultiLineChart
                    {...LineChartProps}
                    seriesCloseable
                    loading={props.chartDataLoading}
                    seriesOnClose={(item, index) => {
                      const newUnitMap = _.omitBy(unitMap, (value, key) => `${key}` === item.value)
                      setUnitMap(newUnitMap);
                      // 删除tag
                      let flag = false;
                      const newTagDataSource = tagDataSource.map(i => {
                        if (`${item.value}` === `${i.pointNumbers}` && selectKeys[0] !== i.value) {
                          flag = true;
                          return null
                        } else if ((i.pointNumbers || '').indexOf(`${item.value}`) > -1) {
                          i.pointNumbers = i.pointNumbers.split(',').filter(it => it !== item.value).join();
                          i.extraNumber--;
                        }
                        return i
                      }).filter(i => !!i);
                      setTagDataSource(newTagDataSource);
                      if (flag) {
                        if (newTagDataSource[0]) {
                          const { value, node } = newTagDataSource[0];
                          setSelectKeys([value]);
                          setExpandedKeys(value.split('-').reduce((pre, i) => [...pre, `${pre.length === 0 ? i : `${pre[pre.length - 1]}-${i}`}`], []));
                          props.action('fetchPointDataType', { deviceTypeId: node.typeId, deviceId: node.id, deviceTitle: node.title });
                        } else {
                          setSelectKeys([]);
                          props.action('updateState', { checkBoxOptions: [] });
                        }
                      }
                      return false
                    }}
                  />
                ) : null
              }
              {/* {LineChartProps.series.length === 0 ? (
                <LineChart
                  {...LineChartProps}
                  seriesCloseable
                  loading={props.chartDataLoading}
                  seriesOnClose={(item, index) => {
                    const newUnitMap = _.omitBy(unitMap, (value, key) => `${key}` === item.value)
                    setUnitMap(newUnitMap)
                  }}
                />
              ) : (
                <MultiLineChart
                  {...LineChartProps}
                  seriesCloseable
                  loading={props.chartDataLoading}
                  seriesOnClose={(item, index) => {
                    const newUnitMap = _.omitBy(unitMap, (value, key) => `${key}` === item.value)
                    console.log('newUnitMap', newUnitMap, unitMap)
                    setUnitMap(newUnitMap)
                  }}
                />
              )} */}
            </div>
          </div>
        </div>
        {modalVisible && (
          <DetailModal
            columns={columns}
            listData={listData}
            closeModal={() => setModalVisible(false)}
            exportCsv={exportCsv}
          />
        )}
      </div>
    </Page>
  )
}

const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children: children?.map((item, index) => ({ ...item, key: `${key}-${index}` })),
      };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });
}

const getTreeName = (treeData, treeKeys: string[] = [], flag = false) => {
  if (treeKeys?.length > 1) {
    if (!flag) {
      return `${getTreeName(treeData[treeKeys[0]]?.children || [], treeKeys.filter((_, i) => i > 0), treeData[treeKeys[0]]?.type === "Station")}`
    }
    return `${treeData[treeKeys[0]]?.title}-${getTreeName(treeData[treeKeys[0]]?.children || [], treeKeys.filter((_, i) => i > 0), treeData[treeKeys[0]]?.type === "Station")}`
  } else if (treeKeys?.length === 1) {
    return treeData[treeKeys[0]]?.title
  }
  return null
}


const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationDetail: state.global.stationDetail,
    stationList: state.global.stationList,
    treeLoading: getLoading('fetchDeviceTree'),
    listLoading: getLoading('fetchPointDataType'),
    listSuccess: isSuccess('fetchPointDataType'),
    chartDataLoading: getLoading('fetchChartData'),
  }
}

export default makeConnect(modelKey, mapStateToProps)(HistoryDataQuery)
