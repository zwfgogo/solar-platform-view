import React, { useEffect, useMemo, useState } from 'react'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { getCheckItemValue, IndicatorAnalysisModal } from './model'
import styles from './index.less'
import { makeConnect } from '../umi.helper'
import { indicator_analysis } from '../constants'
import DeviceTree from './components/DeviceTree'
import CheckList from '../common-history-data-query/components/CheckList'
import { Button, FullLoading, message, RangePicker } from 'wanke-gui'
import ToggleButton from '../common-history-data-query/components/ToggleButton'
import { triggerEvent } from '../../util/utils'
import { WankeAllSelectOutlined, WankeHalfSelectOutlined } from 'wanke-icon'
import { getSystemTime, getTargetSystemTime, isBigThanToday } from '../../util/dateUtil'
import TabSelect from '../../components/TabSelect'
import moment from 'moment'
import DetailModal from '../common-history-data-query/components/DetailModal'
import IndicatorChart from './components/IndicatorChart'
import { exportFile } from '../../util/fileUtil'

const MAX_DATA_LEN = 8;
const MAX_UNIT_LEN = 2;

const PickerMap = {
  'day': 'date',
  'month': 'month',
  'year': 'year'
}

const MaxLengthMap = {
  'day': 7,
  'month': 12,
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

interface Props extends PageProps,
  IndicatorAnalysisModal,
  MakeConnectProps<IndicatorAnalysisModal> {
    // model
    selectedStationId?: number
    treeListLoading?: boolean
    indicatorListLoading?: boolean
    selectedStation?: any
}

const IndicatorAnalysis: React.FC<Props> = (props) => {
  const { selectedStationId, checkedIndicatorList, selectedStation } = props // timeZone
  const [selectedKeys, setSelectedKeys] = useState([])
  const [checkboxDisplay, setCheckboxDisplay] = useState(false);
  const [treeVisible, setTreeVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (keys, selectedItem) => {
    const flag = checkboxDisplay ? !!keys.length : true
    setCheckboxDisplay(flag)
    if (keys.length === 0) {
      return
    }
    const { type, id } = selectedItem
    setSelectedKeys(keys)
    props.action('fetchIndicatorList', { typeName: type, deviceId: id })
  }

  const handleCheckChange = (keys) => {
    const list = checkedIndicatorList.concat(props.checkList)

    const newCheckList = []
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i]
      const target = list.find(indicator => indicator.value === key)
      if (target) {
        newCheckList.push(target)
      }
    }

    const unitMap = {}
    newCheckList.forEach(item => {
      unitMap[item.unit] = true
    })
    if (Object.keys(unitMap).length > MAX_UNIT_LEN) {
      message.error(utils.intl('数据项单位不能超过2类'));
      return
    }

    if (newCheckList.length > MAX_DATA_LEN) {
      message.error(utils.intl('显示曲线数据时曲线总数不大于8条'));
      return
    }

    props.updateState({ checkedIndicatorList: newCheckList })
  }

  const handleClickDocument = () => {
    setCheckboxDisplay(false)
  }

  const formatIconTreeList = (treeList, checkedList) => {
    if (!treeList || !treeList.length) return []
    return treeList.map(node => {
      const { children, ...rest } = node
      let checkCount = 0
      checkedList.forEach(item => {
        const [deviceId] = getCheckItemValue(item.value)
        if (deviceId === node.id?.toString()) checkCount++
      })
      let isSelect = checkCount 
      let isAll = checkCount && checkCount === props.checkListMap[node.id]?.length

      return {
        ...rest,
        children: formatIconTreeList(children, checkedList),
        icon: isSelect ? renderIcon(isAll) : undefined
      }
    })
  }

  // 切换维度
  const changeTime = item => {
    let timeRange: any = [moment().startOf('day'), moment().endOf('day')]
    props.updateState({ timeMode: item.key, timeRange })
    fetchData()
  }

  // 切换时间
  const onTimeChange = (dates, dateStrings) => {
    props.updateState({ timeRange: dates })
    fetchData()
  }

  const handleShowTableData = () => {
    if (!checkedIndicatorList.length) {
      message.error(utils.intl('请选择指标'))
      return
    }
    setModalVisible(true)
  }

  const treeIconList = useMemo(() => {
    return formatIconTreeList(props.treeList, checkedIndicatorList)
  }, [JSON.stringify(props.treeList), JSON.stringify(checkedIndicatorList)])

  // 选中设备变化
  useEffect(() => {
    if (selectedStationId) {
      setSelectedKeys([])
      props.updateState({ checkedIndicatorList: [] })
      props.action('fetchTreeList', { id: selectedStationId })
    }
  }, [selectedStationId])

  const fetchData = () => {
    props.action('fetchChartData', {
      dispatch: props.dispatch,
      selectedStationId
    })
  }

  const exportCsv = () => {
    exportFile(props.columns, filterTableData(props.tableList, selectedStation.timeZone));
  }

  // 勾选指标变化
  useEffect(() => {
    fetchData()
  }, [JSON.stringify(checkedIndicatorList)])

  useEffect(() => {
    window.addEventListener('click', handleClickDocument)
    return () => {
      props.action('reset')
      props.action('closeSocket')
      window.removeEventListener('click', handleClickDocument)
    }
  }, [])

  return (
    <Page
      showStation={true}
      pageId={props.pageId}
      pageTitle={utils.intl('指标数据查询')}
      style={{ background: 'unset' }}
    >
      <article className={styles['page-container']}>
        {
          checkboxDisplay && treeVisible && (
            <CheckList
              totalChangeMode
              loading={props.indicatorListLoading}
              value={checkedIndicatorList.map(item => item.value)}
              onChange={handleCheckChange}
              dataSource={props.checkList}
            />
          )
        }
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
          <aside className={styles['aside']} style={{ borderRightWidth: checkboxDisplay ? 1 : 0 }}>
            {
              props.treeListLoading && (<FullLoading />)
            }
            <DeviceTree
              treeList={treeIconList}
              onSelect={handleSelect}
              selectedKeys={selectedKeys}
            />
          </aside>
        )}
        <section className={styles['content']}>
          <header>
            <div style={{ display: 'flex' }}>
              <TabSelect list={tabList} onClick={changeTime} value={props.timeMode} />
              {props.timeMode !== 'total' && (
                <RangePicker
                  style={{ marginLeft: 16 }}
                  picker={PickerMap[props.timeMode]}
                  disabledDate={current => isBigThanToday(current)}
                  allowClear={false}
                  maxLength={MaxLengthMap[props.timeMode]}
                  maxLengthType={props.timeMode as any}
                  value={props.timeRange}
                  onChange={onTimeChange}
                />
              )}
            </div>
            <Button
              onClick={handleShowTableData}
              disabled={checkedIndicatorList.length === 0}
            >{utils.intl('查看数据表')}</Button>
          </header>
          <div className={styles['chart-container']}>
            {props.socketLoading['getChart'] && <FullLoading />}
            <IndicatorChart
              chartLoading={false}
              data={props.chartData}
              timeRange={props.timeRange}
              timeMode={props.timeMode}
            />
          </div>
          {/* <footer></footer> */}
        </section>
        {modalVisible && (
          <DetailModal
            columns={props.columns}
            listData={filterTableData(props.tableList, selectedStation.timeZone)}
            closeModal={() => setModalVisible(false)}
            exportCsv={exportCsv}
          />
        )}
      </article>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    selectedStation: state.global.selectedStation,
    treeListLoading: getLoading('fetchTreeList'),
    indicatorListLoading: getLoading('fetchIndicatorList'),
  }
}

export default makeConnect(indicator_analysis, mapStateToProps)(IndicatorAnalysis)


const renderIcon = (isAll) => {
  return isAll
    ? (
      <WankeAllSelectOutlined style={{ color: "#177ddc" }}></WankeAllSelectOutlined>
    )
    : (
      <WankeHalfSelectOutlined style={{ color: "#177ddc" }}></WankeHalfSelectOutlined>
    )
}

function filterTableData(list, timeZone) {
  const curTime = getTargetSystemTime(timeZone).format('YYYY-MM-DD HH:mm:ss')
  return list.filter(item => {
    const time = item.date
    return time <= curTime.slice(0, time.length)
  })
}

// todo: 图表颜色列表 