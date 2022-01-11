import React, { useEffect, useRef, useState } from 'react'
import { DatePicker, message, Select } from 'wanke-gui'
import CommonEcharts from '../../../components/charts/common-echarts/CommonEcharts'
import { CustomChartOption, useEchartsOption } from '../../../components/charts/common-echarts/useEchartsOption'
import { battery_cabin, Socket_Port } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { BatteryCabinState } from '../models'
import style from './batteryRunningChart.less'
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import { MultipleSelectPlaceholderMap, ParentSelectPlaceholderMap, ViewMode, ViewTypeDataSource } from '../constants'
import moment from 'moment'
import { disabledDateAfterToday } from '../../../util/dateUtil'
import utils from '../../../public/js/utils'

const colorList = ["#0062ff", "#3dd598", "#ff974a", "#fc5a5a"]

const grid = {
  left: "60",
  right: "16",
  top: "40",
  bottom: "36"
}

const firstGrid = {
  left: "60",
  right: "16",
  top: "40",
  bottom: "36"
}

const MAX_NUM = 6;

interface Props extends BatteryCabinState, MakeConnectProps<BatteryCabinState> {
  realEnergyId: number
}

const BatteryRunningChart: React.FC<Props> = (props) => {
  const [hasPack, setHasPack] = useState(false)
  const { runningDataType, batteryUnitList, batteryClusterList, packList } = props
  // console.log('props', props.voltageChart, props.currentChart)
  const { option: option1 } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showLegend: true,
    showUnit: true,
    data: props.voltageChart,
    formatLabel: value => {
      return moment(value).format('HH:mm')
    },
    customOption: {
      grid: firstGrid,
      tooltip: { appendToBody: false, confine: true },
      legend: {
        type: 'scroll'
      },
      yAxis: {
        name: `${utils.intl('电压')}(V)`
      }
    }
  })
  const { option: option2 } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showLegend: true,
    showUnit: true,
    data: props.currentChart,
    formatLabel: value => {
      return moment(value).format('HH:mm')
    },
    customOption: {
      grid,
      tooltip: {
        appendToBody: false,
        confine: true
      },
      legend: { show: false },
      yAxis: {
        name: `${utils.intl('电流')}(A)`
      }
    }
  });
  const { option: option3 } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showLegend: true,
    showUnit: true,
    data: props.powerChart,
    formatLabel: value => {
      return moment(value).format('HH:mm')
    },
    customOption: {
      grid,
      tooltip: {
        appendToBody: false,
        confine: true
      },
      legend: { show: false },
      yAxis: {
        name: `${utils.intl('有功功率')}(kW)`
      }
    }
  })
  const { option: option4 } = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showLegend: true,
    showUnit: true,
    data: props.socChart,
    formatLabel: value => {
      return moment(value).format('HH:mm')
    },
    customOption: {
      grid,
      tooltip: {
        appendToBody: false,
        confine: true
      },
      legend: { show: false },
      yAxis: {
        name: 'SOC(%)'
      }
    }
  })

  const chartCount = useRef(0);
  // 图标联动处理
  const handleChartCreate = (chart) => {
    chartCount.current++
    chart.group = 'chart'
    if (chartCount.current === 4) {
      echarts.connect('chart')
    }
  }

  const handleSelectChange = (val, key) => {
    const newState: any = { [key]: val }
    switch(key) {
      case 'runningDataType':
        newState.selectParentDeviceId = null
        newState.selectDeviceIds = []
        newState.batteryClusterList = []
        newState.packList = []
        if (val === ViewMode.Pack) {
          props.action('fetchBatteryCluster', { id: props.realEnergyId })
        } else if(val === ViewMode.BatteryUnit) {
          newState.selectDeviceIds = batteryUnitList.map(item => item.value)
        }
        break;
      case 'selectParentDeviceId':
        newState.selectDeviceIds = []
        switch (runningDataType) {
          case ViewMode.BatteryCluster:
            props.action('fetchBatteryCluster', { id: val })
              .then((list) => {
                props.updateState({ selectDeviceIds: list.slice(0, MAX_NUM).map(item => item.value) })
              })
            break;
          case ViewMode.Pack:
            props.action('fetchPack', { id: val })
              .then((list) => {
                props.updateState({ selectDeviceIds: list.slice(0, MAX_NUM).map(item => item.value) })
              })
            break;
        }
        break;
      case 'selectDeviceIds':
        if (val.length > MAX_NUM) {
          message.error(utils.intl("最多选择{0}个设备", MAX_NUM))
          return
        }
        break;
    }
    props.action('resetSocketDate')
    // 清空子级选中
    props.updateState(newState)
  }

  let parentSelectList = []
  let multipleSelectList = []
  if (runningDataType === ViewMode.BatteryCluster) {
    parentSelectList = batteryUnitList
    multipleSelectList = batteryClusterList
  } else if (runningDataType === ViewMode.Pack) {
    parentSelectList = batteryClusterList
    multipleSelectList = packList
  } else {
    multipleSelectList = batteryUnitList
  }

  // 能量单元改变时
  useEffect(() => {
    if(props.realEnergyId) {
      const targetEnergy = props.energyList?.find(item => item.value === props.realEnergyId)
      setHasPack(targetEnergy && targetEnergy.hasPack)
      // 初始化数据
      props.action('resetSocketDate')
      // 重置筛选条件
      props.updateState({
        viewTime: moment(),
        runningDataType: ViewMode.BatteryUnit,
        selectParentDeviceId: null,
        selectDeviceIds: [],
        batteryUnitList: [],
        batteryClusterList: [],
        packList: [],
      })
      // 获取电池单元
      props.action('fetchBatteryUnit', { realEnergyId: props.realEnergyId })
        .then((list) => {
          props.updateState({ selectDeviceIds: list.slice(0, MAX_NUM).map(item => item.value) })
        })
    }
  }, [props.realEnergyId])

  // socket请求数据
  useEffect(() => {
    if (props.selectDeviceIds.length) {
      props.action('fetchRunningData')
    }
  }, [
    props.viewTime.format('YYYY-MM-DD'),
    props.selectDeviceIds
  ])

  useEffect(() => {
    props.action('initSocket', { dispatch: props.dispatch })
    return () => {
      props.action('reset')
    }
  }, [])

  return (
    <div className={style["running-chart"]}>
      <div className={style["filter"]}>
        <DatePicker
          value={props.viewTime}
          onChange={(viewTime) => props.updateState({ viewTime })}
          style={{ width: 160, marginRight: 16 }}
          allowClear={false}
          disabledDate={disabledDateAfterToday}
        />
        <div style={{ width: 160, marginRight: 16 }}>
          <Select
            value={runningDataType}
            onChange={(val) => handleSelectChange(val, 'runningDataType')}
            style={{ width: 160 }}
            dataSource={hasPack ? ViewTypeDataSource : ViewTypeDataSource.slice(0, 2)}
          />
        </div>
        {runningDataType !== ViewMode.BatteryUnit && (
          <div style={{ width: 160, marginRight: 16 }}>
            <Select
              value={props.selectParentDeviceId}
              onChange={(val) => handleSelectChange(val, 'selectParentDeviceId')}
              placeholder={ParentSelectPlaceholderMap[runningDataType]}
              style={{ width: 160 }}
              dataSource={parentSelectList}
            />
          </div>
        )}
        <div style={{ width: 330 }}>
          <Select
            value={props.selectDeviceIds}
            onChange={(val) => handleSelectChange(val, 'selectDeviceIds')}
            placeholder={MultipleSelectPlaceholderMap[runningDataType]}
            style={{ width: 330 }}
            mode="multiple"
            // checkAllText={utils.intl("全选")}
            showAllSelect={false}
            maxTagCount='responsive'
            dataSource={multipleSelectList}
          />
        </div>
      </div>
      <article className={style["chart-container"]}>
        <section className={style["chart-item"]} style={{ height: 170 }}>
          <CommonEcharts option={option1} onCreateMap={handleChartCreate} />
        </section>
        <section className={style["chart-item"]} style={{ height: 170 }}>
          <CommonEcharts option={option2} onCreateMap={handleChartCreate} />
        </section>
        <section className={style["chart-item"]} style={{ height: 170 }}>
          <CommonEcharts option={option3} onCreateMap={handleChartCreate} />
        </section>
        <section className={style["chart-item"]} style={{ height: 170 }}>
          <CommonEcharts option={option4} onCreateMap={handleChartCreate} />
        </section>
      </article>
    </div>
  )
}

export default makeConnect(battery_cabin, (state: any) => ({
  ...state,
}))(BatteryRunningChart)
