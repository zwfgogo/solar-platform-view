import React, { useEffect, useState, useMemo, useRef } from 'react'
import moment from 'moment'
import { makeConnect } from '../../umi.helper'
import { running_data_anaylze } from '../../constants'
import { RunningDataAnalyzeModal, ObjectType, DataType, EIndicatorsDeviceListMap, EIndicators, TimeFormaterMap, getConnectNodeTitle, getNodeList } from './model'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import styles from './running-data-analyze.less'
import { Select, Button, message, RangePicker } from 'wanke-gui'
import { GfDataTableOutlined, GfDatabaseOutlined } from 'wanke-icon'
import TabSelect from '../../../components/TabSelect'
import HistoryChart from './components/HistoryChart'
import HistoryTable from './components/HistoryTable'
import { triggerEvent } from '../../../util/utils'
import DataModal from './components/DataModal'
import MultiplyTreeSelect from '../../../components/TreeSelect/MultiplyTreeSelect'
import { traverseTree } from '../../page.helper'
import { disabledDateAfterToday } from '../../../util/dateUtil'
import utils from '../../../public/js/utils';

const PickerMap = {
  'day': 'date',
  'month': 'month',
  'year': 'year'
}

export const tabList = [
  {
    key: "day",
    name: utils.intl('日'),
    value: "day"
  },
  {
    key: "month",
    name: utils.intl('月'),
    value: "month"
  },
  {
    key: "year",
    name: utils.intl('年'),
    value: "year"
  },
  {
    key: "total",
    name: utils.intl('总'),
    value: "total"
  }
]

const ObjectList = [
  { name: utils.intl('电站'), value: ObjectType.Station },
  { name: utils.intl('设备'), value: ObjectType.Device }
]

const DataTypeListMap = {
  [ObjectType.Station]: [{ name: utils.intl('指标'), value: DataType.Indicator }],
  [ObjectType.Device]: [
    { name: utils.intl('指标'), value: DataType.Indicator },
    { name: utils.intl('量测点'), value: DataType.Measurement }
  ],
}

interface Props 
  extends RunningDataAnalyzeModal,
    MakeConnectProps<RunningDataAnalyzeModal> {
  loading?: boolean
  objectTreeLoading?: boolean
  measurementTreeLoading?: boolean
}

const RunningDataAnalyze: React.FC<Props> = (props) => {
  const [displayKeysList, setDisplayKeysList] = useState([[], []])
  const {
    query,
    chartData,
    tableList,
    treeList,
    objectTreeLoading,
    measurementTreeLoading,
    checkedKeysTableData,
    tableColumns
  } = props;
  const { objectType, dataType, timeMode, timeRange, checkedKeysList } = query;

  const chartsRef = useRef<any>()

  // 重置图表显隐
  const clearHideSeries = () => {
    chartsRef.current?.clearHidedSeries()
  }

  // 对象改变
  const handleObjectChange = (val) => {
    props.updateQuery({
      objectType: val,
      dataType: DataType.Indicator,
      checkedKeysList: [[], []]
    })
    fetchTreeList()
    clearHideSeries()
    if(dataType === DataType.Measurement) {
      resizeChart()
    }
  }

  // 数据项改变
  const handleDataTypeChange = (val) => {
    props.updateQuery({ dataType: val, checkedKeysList: [[], []] })
    props.updateState({
      treeList: [treeList[0], []]
    })
    if(val === DataType.Measurement) {
      props.updateQuery({ timeMode: 'day' })
    }
    fetchTreeList()
    clearHideSeries()
    resizeChart()
  }

  const resizeChart = () => {
    setTimeout(() => {
      triggerEvent('resize', window)
    })
  }

  // 切换维度
  const changeTime = item => {
    if(objectType === ObjectType.Device && dataType === DataType.Indicator) {
      if(checkedKeysList[1].indexOf(EIndicators.DIVERGENCERATE.toString()) > -1) {
        message.info(utils.intl('离散率只能查看日维度'))
        return
      }
      changeDeviceTreeList(treeList, displayKeysList, item.key)
    }
    props.updateQuery({ timeMode: item.key })
    fetchData()
  }

  const handleTimeRangeChange = (range) =>  {
    props.updateQuery({ timeRange: range })
    fetchData()
  }

  // 确认勾选对象和数据项回调
  const handleCheck = (keysList) => {
    console.log(keysList)
    if(!keysList[0].length) {
      message.error(utils.intl('请选择对象'))
      return false
    } else if(!keysList[1].length) {
      message.error(utils.intl('请选择数据项'))
      return false
    } else {
      clearHideSeries()
      props.updateQuery({ checkedKeysList: keysList })
    }
    return true
  }

  // 勾选时回调，确认前
  const handleDisplayCheck = (keysList) => {
    setDisplayKeysList(keysList)
  }

  // 获取设备树
  const fetchTreeList = () => {
    props.action('getTreeList')
  }

  // 获取量测点数据项
  const fetchMeasurement = (val) => {
    props.action('getMeasurement', { targetId: val })
  }

  // 获取图表和表格
  const fetchTableColumns = () => {
    props.action('getTableColumns')
  }

  const fetchData = () => {
    if(checkedKeysList[0].length && checkedKeysList[1].length) {
      props.action('getData')
    }
  }

  // 表格删除行
  const handleDeleteDeviceKey = ({ targetKey }) => {
    const deviceKeys = checkedKeysList[0].filter(key => key !== targetKey)
    const datakeys = deviceKeys.length ? checkedKeysList[1] : []
    props.updateQuery({ checkedKeysList: [deviceKeys, datakeys] })
  }

  // 针对设备-指标，不能跨电站或跨设备类型选择
  const handleCheckExamine = (keys) => {
    if(objectType === ObjectType.Device && dataType === DataType.Indicator) {
      let flag = true
      let type, stationKey
      keys.some(key => {
        let target = traverseTree(treeList[0], item => item.key == key ? item : null)
        if(target) {
          if(type && type !== target.typeName) {
            flag = false
            message.error(utils.intl('不能跨电站或跨设备类型选择'))
            return true
          }
          if(stationKey && stationKey !== target.parentKeys[0]) {
            flag = false
            message.error(utils.intl('不能跨电站或跨设备类型选择'))
            return true
          }
          type = target.typeName
          stationKey = target.parentKeys[0]
        }
        return false
      })
      return flag
    }
    return true
  }

  // 针对指标，不允许勾选超过三个数据项
  const handleDataCheckExamine = (keys) => {
    if(keys.length > 3) {
      message.error(utils.intl('runningDataAnalyze.最多选择三个数据项'))
      return false
    }
    return true
  }

  // 设备指标的时候切换选中设备
  const changeDeviceTreeList = (treeList, displayKeysList, timeMode) => {
    let list = []
    let listMap = EIndicatorsDeviceListMap();
    if(displayKeysList[0].length) {
      let target = traverseTree(treeList[0], item => item.key === displayKeysList[0][0] ? item : null)
      if(target && listMap[target.typeName]) {
        list = listMap[target.typeName]
      }

      if(timeMode !== 'day') {
        list = list.filter(item => item.key !== EIndicators.DIVERGENCERATE.toString())
      }
    }

    props.updateState({
      treeList: [
        treeList[0],
        list
      ]
    })
  }

  // 获取导出文件名字
  const getExportFileName = () => {
    let str = ''
    if(checkedKeysList[0].length && checkedKeysList[1].length) {
      const dataTypeTarge = traverseTree(treeList[1], item => item.key === displayKeysList[1][0] ? item : null)
      if(objectType === ObjectType.Station) {
        str = `${utils.intl('电站')}-${dataTypeTarge.title}`
      } else {
        const objectTarge = traverseTree(treeList[0], item => item.key === displayKeysList[0][0] ? item : null)
        const stationTarge = traverseTree(treeList[0], item => item.key === objectTarge.parentKeys[0] ? item : null)
        str = `${stationTarge.title}-${objectTarge.title}-${dataTypeTarge.title}`
      }
    }
    str += `-${timeRange[0].format(TimeFormaterMap[timeMode].replace(/-/g, ''))}-${timeRange[1].format(TimeFormaterMap[timeMode].replace(/-/g, ''))}`
    console.log('filename', str)
    return str
  }

  // 点击设备树 获取量测点的数据项
  useEffect(() => {
    if(dataType === DataType.Measurement && displayKeysList[0].length) {
      fetchMeasurement(displayKeysList[0][0])
    } else if(objectType === ObjectType.Device && dataType === DataType.Indicator) {
      changeDeviceTreeList(treeList, displayKeysList, timeMode)
    }
  }, [JSON.stringify(displayKeysList[0])]);

  useEffect(() => {
    if(checkedKeysList[0].length && checkedKeysList[1].length) {
      fetchTableColumns()
    } else {
      props.updateState({
        chartData: {},
        tableList: [],
        checkedKeysTableData: []
      })
    }
  }, [JSON.stringify(checkedKeysList)]);

  useEffect(() => {
    fetchTreeList()
    props.action('init', { dispatch: props.dispatch })
    return () => {
      props.action('reset')
      props.action('closeSocket')
    }
  }, []);

  // 获取投产时间
  let { chartTitle, productionTime } = useMemo(() => {
    const result = {
      chartTitle: '',
      productionTime: undefined
    }
    if(dataType === DataType.Measurement && checkedKeysList[0].length && checkedKeysList[1].length) {
      const objectNodeList = getConnectNodeTitle(treeList[0], checkedKeysList[0])[0] || [] // 电站或设备
      let dataNodeList = getConnectNodeTitle(treeList[1], checkedKeysList[1])[0] || [] // 数据项
      result.chartTitle = `${objectNodeList[objectNodeList.length - 1].title} ${dataNodeList[0].title}`
    }

    return result
  }, [JSON.stringify(checkedKeysList)])

  const handleDisabledDate = (current) => {
    // const isBeforeProduction = productionTime && current.isBefore(moment(productionTime).startOf('days'))
    return disabledDateAfterToday(current)
  }

  const handleResetCheckList = () => {
    props.updateQuery({ checkedKeysList: [[], []] })
  }

  const getTreeList = () => {
    if(objectType === ObjectType.Station && !displayKeysList[0].length) return [treeList[0], []]
    return treeList
  }

  return (
    <article className={styles['page-container']}>
      <section className={styles['menu']}>
        <div style={{ width: 150, marginRight: 20 }}>
          <Select
            value={objectType}
            dataSource={ObjectList}
            onSelect={handleObjectChange}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ width: 150, marginRight: 20 }}>
          <Select
            value={dataType}
            dataSource={DataTypeListMap[objectType]}
            onSelect={handleDataTypeChange}
            style={{ width: '100%' }}
          />
        </div>
        <MultiplyTreeSelect
          title={utils.intl('请选择对象&数据项')}
          treeData={getTreeList()}
          onCheck={handleCheck}
          onDisplayCheck={handleDisplayCheck}
          checkedKeys={checkedKeysList}
          optionList={[{
            // title: '请选择对象',
            singleCheck: dataType === DataType.Measurement,
            loading: objectTreeLoading,
            placeholder: utils.intl('请输入对象名称'),
            showAll: objectType === ObjectType.Station,
            isVirtual: objectType === ObjectType.Device,
            checkExamine: handleCheckExamine
          }, {
            // title: '请选择数据项',
            singleCheck: dataType === DataType.Measurement,
            loading: measurementTreeLoading,
            placeholder: utils.intl('请输入数据项名称'),
            checkExamine: handleDataCheckExamine
          }]}
        >
          <Button type='primary'>
            <GfDataTableOutlined style={{ fontSize: 14 }} />{utils.intl('选择数据项')}
          </Button>
        </MultiplyTreeSelect>
        <div className={styles['desc']}>
          <span>{utils.intl('已选择对象')}：{checkedKeysList[0]?.length ?? 0}{utils.intl('个')}</span>
          <span>{utils.intl('已选择数据项')}：{checkedKeysList[1]?.length ?? 0}{utils.intl('个')}</span>
        </div>
      </section>
      <section className={styles['chart-container']}>
        <header className={styles['filter']}>
          <div className={styles['chart-title']}>{chartTitle}</div>
          <div className={styles['left']}>
            {dataType !== DataType.Measurement && (
              <div style={{ marginRight: 20 }}>
                <TabSelect list={tabList} onClick={changeTime} value={timeMode} />
              </div>
            )}
            <div>
              {timeMode !== 'total' ? (
                <RangePicker
                  disabledDate={handleDisabledDate}
                  allowClear={false}
                  picker={PickerMap[timeMode]}
                  style={{ height: 28 }}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                />
                ) : ''
              }
            </div>
          </div>
          <DataModal
            className={styles['data-table-btn']}
            columns={tableColumns}
            tableData={tableList}
            onOpen={() => {
              if(checkedKeysList[0].length && checkedKeysList[1].length) {
                return true
              }
              message.error(utils.intl('请选择对象和数据项'))
              return false
            }}
            getExportFileName={getExportFileName}
          >
            <GfDatabaseOutlined style={{ fontSize: 20, marginRight: 10 }} />
            <span>{utils.intl('数据表')}</span>
          </DataModal>
        </header>
        <footer className={styles['content']}>
          <HistoryChart
            chartData={chartData}
            timeMode={timeMode}
            showTime={dataType === DataType.Measurement}
            timeRange={timeRange}
            theme={props.theme}
            chartsRef={chartsRef}
          />
        </footer>
      </section>
      {dataType === DataType.Indicator && (
      <section className={styles['table-container']}>
        <HistoryTable
          tableData={checkedKeysTableData}
          objectType={objectType}
          onDelete={handleDeleteDeviceKey}
          onDeleteAll={handleResetCheckList}
        />
      </section>
      )}
    </article>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loading: getLoading("getData"),
    objectTreeLoading: getLoading("getTreeList"),
    measurementTreeLoading: getLoading("getMeasurement"),
    theme: state.global.theme
  }
}

export default makeConnect(running_data_anaylze, mapStateToProps)(RunningDataAnalyze)
