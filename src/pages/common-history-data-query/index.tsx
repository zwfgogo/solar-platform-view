import React, { useState, useEffect, useMemo } from 'react';
import Page from '../../components/Page';
import { Row, Col, Button, RangePicker, Radio, LineChart, Table2, message } from 'wanke-gui';
import { Checkbox } from 'antd';
import PageProps from '../../interfaces/PageProps';
import { makeConnect, updateState } from '../umi.helper';
import MakeConnectProps from '../../interfaces/MakeConnectProps';
import LeftTree from '../storage-station-monitor/components/LeftTree';
import { HistoryDataQueryState } from './model';
import { h_d_q } from '../constants';
import FullLoading from '../../components/FullLoading';
import utils from '../../public/js/utils';
import { copy, triggerEvent } from '../../util/utils';
import moment from 'moment';
import { WankeHalfSelectOutlined, WankeAllSelectOutlined } from 'wanke-icon';
import useLocalTablePage from '../../hooks/useLocalTablePage';
import { exportFile } from '../../util/fileUtil';
import { getSystemTime, isBigThanToday } from '../../util/dateUtil';
import { isEmpty } from 'lodash';
import CheckList from './components/CheckList';
import ToggleButton from './components/ToggleButton';
import DetailModal from './components/DetailModal';
import MultiLineChart from '../../components/charts/MultiLineChart';
import "./index.less"

const RadioGroup = Radio.Group
const MAX_DATA_LEN = 8;
const MAX_UNIT_LEN = 2;

interface Props extends PageProps, MakeConnectProps<HistoryDataQueryState>, HistoryDataQueryState {
  treeLoading: boolean;
  listLoading: boolean;
  listSuccess: boolean;
  selectedStationId: number,
  stationDetail: any,
  stationList: any[]
}

const HistoryDataQuery: React.FC<Props> = function (this: null, props) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [dataItem, setDataItem] = useState(1);
  const [checkboxDisplay, setCheckboxDisplay] = useState(false);
  const [treeVisible, setTreeVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
const [noCheckedValues, setNoCheckedValues] = useState([])

  // const [startTime, setStartTime] = useState(moment().startOf('day'));
  // const [endTime, setEndTime] = useState(moment().endOf('day'));
  const [mode, setMode] = useState(null);
  const [treeType, setTreeType] = useState(null);
  const stationId = props.selectedStationId;
  const treeList = useMemo(() => {
    const treeList = copy(props.treeList);
    if (treeList.length) {
      const target = (props.stationList ?? []).find(item => item.id === props.selectedStationId);
      treeList[0].title = target?.title;
    }
    return treeList
  }, [JSON.stringify(props.treeList)]);

  const { columns, listData } = useMemo(() => {
    let columns: any = [{
      title: utils.intl('序号'),
      width: 65,
      // align: 'center',
      dataIndex: 'num'
    }, {
      title: utils.intl('数据时间'),
      dataIndex: 'time',
    }];
    const chartData = copy(props.chartData);
    for (const item of chartData.series) {
      columns.push({
        title: item.name,
        dataIndex: item.name,
        ellipsis: true,
        // align: 'right'
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
          ? `${chartData.yData[i][j].value}${chartData.series[i].unit}`
          : '';
      }
    }
    return { columns, listData }
  }, [JSON.stringify(props.checkKeyMap), JSON.stringify(props.chartData)])

  const {
    startTime,
    endTime,
    onTimeChange
  } = useLocalTablePage({
    data: listData,
    defaultPageSize: 20
  })

  const chartData: any = props.checkedValues.length ? props.chartData : {}

  const LineChartProps = {
    series: (chartData.series || []).filter(item => item.name !== 'undefined'),
    xData: chartData.xData || [],
    yData: chartData.yData || [],
    options: {
      backOpacity: [0, 0],
      startDate: startTime.valueOf(),
      endDate: endTime.valueOf(),
      dateFormat: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
      tooltipDateFormat: 'YYYY-MM-DD HH:mm:ss',
      margin: { left: 70 }
      // tickValues: props.chartData.xData.map(timeStr => moment(timeStr).valueOf())
    }
  }

  const [iconTreeList, setIconTreeList] = useState(treeList);

  const  checkboxOnChange = (checkedValues) => {
    // const cValues = checkedValues.map(item => item.value)
    const options = props.checkboxOptions;
    const tempCheckKeyMap = copy(props.checkKeyMap);
    const curCheckMap = tempCheckKeyMap[props.currentSelectNode.deviceId];
    const curDeviceTitle = curCheckMap.deviceTitle;
    curCheckMap.checked = checkedValues;
    const tempCheckedValues = [];
    for (const key in tempCheckKeyMap) {
      tempCheckedValues.push(...tempCheckKeyMap[key].checked);
    }
    const tempMap = new Map();
    for (const key in tempCheckKeyMap) {
      if (!tempCheckKeyMap[key].checked.length) {
        continue;
      }
      for (const item of tempCheckKeyMap[key].checked) {
        const value = parseInt(key, 10) === props.currentSelectNode.deviceId
          ? item
          : item.value;
        const target = tempCheckKeyMap[key].checkboxOptions.find(subItem => subItem.value === value);
        tempMap.set(target && target.unit ? target.unit : `undefined`, 1);
      }
    }
    if (tempMap.size > MAX_UNIT_LEN) {
      message.error(utils.intl('数据项单位不能超过2类'));
      return
    }
    if (tempCheckedValues.length > MAX_DATA_LEN) {
      message.error(utils.intl('显示曲线数据时曲线总数不大于8条'));
      return
    }

    const energyUnitName = props.energyUnitNameMap[props.currentSelectNode.deviceId]
    const values = [];
    const optionsMap = {};
    for (const item of options) {
      optionsMap[item.value] = `${energyUnitName}-${curDeviceTitle}-${item.label}`;
    }
    for (const item of checkedValues) {
      const target = options.find(subItem => subItem.value === item);
      values.push({
        label: optionsMap ? optionsMap[item] : '',
        value: item,
        unit: target && target.unit ? target.unit : ''
      })
    }
    props.action('updateCheckbox', {
      deviceId: props.currentSelectNode.deviceId,
      checkedValues: values,
      startTime: startTime.format('YYYY-MM-DD'),
      endTime: endTime.format('YYYY-MM-DD')
    })

    // const newNoCheckedValues = noCheckedValues.filter(nItem => cValues.indexOf(nItem) < 0 )
    // setNoCheckedValues(newNoCheckedValues)
  }

  const findTreeNode = (treeList, key) => {
    let target;
    function find(tree, key) {
      for (const item of tree) {
        if (`${item.id}` === `${key}`) {
          target = item;
          break;
        }
        if (item.children && item.children.length) {
          find(item.children, key);
        }
      }
    }
    find(treeList, key);
    return target;
  }

  const exportCsv = () => {
    exportFile(columns, listData, null, {
      filename: `${props.stationDetail?.title} ${(moment(getSystemTime())).format("YYYY-MM-DD HH_mm_ss")}`
    });
  }

  const renderIcon = (isAll) => {
    return isAll
      ? (
        <WankeAllSelectOutlined style={{ color: "#177ddc" }}></WankeAllSelectOutlined>
      )
      : (
        <WankeHalfSelectOutlined style={{ color: "#177ddc" }}></WankeHalfSelectOutlined>
      )
  }

  const updateTreeData = (checkKeyMap) => {
    const iconTreeList = copy(treeList);
    for (const key in checkKeyMap) {
      const treeNode = findTreeNode(iconTreeList, key);
      const isSelect = checkKeyMap[key].checked.length ? true : false;
      const isAll = checkKeyMap[key].checked.length === checkKeyMap[key].checkboxOptions.length;
      if (treeNode && isSelect) {
        treeNode.icon = () => renderIcon(isAll);
      }
    }
    setIconTreeList(iconTreeList.slice());
  }

  const handleClickDocument = () => {
    setCheckboxDisplay(false)
  }

  useEffect(() => {
    props.action('fetchDeviceTree', { stationId });

    return () => {
      props.action("reset")
    }
  }, [props.selectedStationId])

  useEffect(() => {
    if (JSON.stringify(props.checkKeyMap) !== '{}') {
      updateTreeData(props.checkKeyMap);
    }
  }, [JSON.stringify(props.checkKeyMap)])

  useEffect(() => {
    setSelectedKeys([])
    updateTreeData({});
    props.updateState({ checkKeyMap: {} })
  }, [treeList])

  useEffect(() => {
    if (props.checkedValues.length) {
      props.action('fetchPointData', {
        deviceId: props.currentSelectNode.deviceId,
        checkedValues: props.checkedValues,
        startTime: startTime.format('YYYY-MM-DD'),
        endTime: endTime.format('YYYY-MM-DD')
      });
    }
  }, [startTime, endTime])

  useEffect(() => {
    window.addEventListener('click', handleClickDocument)
    return () => {
      window.removeEventListener('click', handleClickDocument)
    }
  }, [])


  return (
    <Page
      showStation={true}
      pageId={props.pageId}
      className={'energy-unit-page'}
      style={{ display: 'flex', background: "transparent", boxShadow: "none" }}
    >
      <ToggleButton
        style={{ left: treeVisible ? 238 : 0 }}
        toLeft={treeVisible}
        onClick={() => {
          setTreeVisible(!treeVisible)
          setTimeout(() => {
            triggerEvent('resize', window)
          })
        }}
      />
      {treeVisible && (
        <div className="left d-flex page-sub-left" style={{ flexShrink: 0, position: 'relative' }}>
          <div className="flex1 f-oa e-pt16 e-pl16 e-pr16 horizontal-scroll-tree" style={{ position: 'relative' }}>
            {
              props.treeLoading && (<FullLoading />)
            }
            <LeftTree
              setSelectedKeys={setSelectedKeys}
              setMode={setMode}
              setCheckedKeys={setCheckedKeys}
              setTreeType={setTreeType}
              treeList={iconTreeList.length ? iconTreeList : treeList}
              selectedKeys={selectedKeys}
              checkedKeys={checkedKeys}
              editable={false}
              action={props.action}
              setCheckboxDisplay={setCheckboxDisplay}
              onSelect={keys => {
                const flag = checkboxDisplay ? !!keys.length : true
                setCheckboxDisplay(flag)
              }}
            />
          </div>
        </div>
      )}
      {
        checkboxDisplay && treeVisible && (
          <CheckList
            loading={props.listLoading}
            value={props.checkedValues.map(item => (item.value))}
            onChange={checkboxOnChange}
            dataSource={props.checkboxOptions}
          />
        )
      }
      <div className="right page-sub-right" style={{ overflow: 'hidden', marginLeft: 0 }}>
        <div
          className="flex1 f-pr"
          style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}
        >
          <Row className="d-flex v-center e-mb16 borderBottom" style={{}}>
            <Col span={24} className="" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span>{utils.intl('时间1')}：</span>
                <RangePicker
                  style={{ marginRight: 20 }}
                  disabledDate={isBigThanToday}
                  allowClear={false}
                  maxLength={7}
                  value={[startTime, endTime]}
                  onChange={onTimeChange}
                />
              </div>
              <Button
                onClick={() => setModalVisible(true)}
                disabled={props.checkedValues.length === 0}
              >{utils.intl('查看数据表')}</Button>
            </Col>
          </Row>
          <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
            <div className="history-query-chart" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
              {LineChartProps.series.length === 0 ? (
                <LineChart
                  {...LineChartProps}
                  seriesCloseable
                  seriesOnClose={(item, index) => {
                    // const newcheckKeyMap = copy(props.checkKeyMap)
                    // newcheckKeyMap[`${item.value.split('-')[0]}`].checked = newcheckKeyMap[`${item.value.split('-')[0]}`].checked.filter(citem => citem.value !== item.value)
                    // props.action('updateState', { checkedValues: props.checkedValues.filter(citem => citem.label !== item.name), checkKeyMap: newcheckKeyMap })
                    // checkboxOnChange(props.checkedValues.filter(cItem => cItem.value !== item.value).map(item => (item.value)))
                    checkboxOnChange(props.checkedValues.filter(citem => citem.label !== item.name).map(item => (item.value)))
                  }}
                />
              ) : (
                <MultiLineChart
                  {...LineChartProps}
                  seriesCloseable
                  seriesOnClose={(item, index) => {
                    // const newcheckKeyMap = copy(props.checkKeyMap)
                    // newcheckKeyMap[`${item.value.split('-')[0]}`].checked = newcheckKeyMap[`${item.value.split('-')[0]}`].checked.filter(citem => citem.value !== item.value)

                    // props.action('updateState', { checkedValues: props.checkedValues.filter(citem => citem.label !== item.name), checkKeyMap: newcheckKeyMap })
                    checkboxOnChange(props.checkedValues.filter(citem => citem.label !== item.name).map(item => (item.value)))
                  }}
                />
              )}
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
      </div>
    </Page >
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationDetail: state.global.stationDetail,
    stationList: state.global.stationList,
    treeLoading: getLoading('fetchDeviceTree'),
    listLoading: getLoading('fetchPointDataType'),
    listSuccess: isSuccess('fetchPointDataType')
  }
}

export default makeConnect(h_d_q, mapStateToProps)(HistoryDataQuery)