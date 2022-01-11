import PlanTracking, { PlanTrackingProps } from './PlanTracking'
import EnergyConsumption, { EnergyConsumptionProps } from './EnergyConsumption'
import ManualControl, { ManualControlProps } from './ManualControl'
import ManualControlSetting, { ManualControlSettingProps } from './ManualControl/ManualControlSetting'
import FirstFM, { FirstFMProps } from './FirstFM'
import SecondFM, { SecondFMProps } from './SecondFM'
import React from 'react'
import moment from 'moment'
import { Input, Select, TimePicker } from 'wanke-gui'
import { Form } from 'antd'

const { Option } = Select

// 策略概览跳转各个策略的枚举---就地模式
export const STRATEGY_MAP = {
  1: {
    title: "计划跟踪",
    component: (props: PlanTrackingProps) => <PlanTracking {...props} />,
  },
  2: {
    title: "光伏限电储能充电控制",
    component: (props: EnergyConsumptionProps) => <EnergyConsumption {...props} />
  },
  3: {
    title: "手动控制",
    component: (props: ManualControlProps) => <ManualControl {...props} />
  },
  "3-1": {
    title: "手动控制-控制参数设置",
    component: (props: ManualControlSettingProps) => <ManualControlSetting {...props} />
  }
}

// 策略概览跳转各个策略的枚举---调度模式
export const DISPATCH_MAP = {
  3:{
    title: '一次调频',
    component: (props: FirstFMProps) => <FirstFM {...props}/>
  },
  4:{
    title: '二次调频',
    component: (props: SecondFMProps) => <SecondFM {...props}/>
  }
}

// 计划跟踪曲线的typeId对应的name
export const PLAN_TRACKING_CHART = [
  'SolarOutputPlan|s', //光伏出力计划
  'SolarActivePower|s', //光伏实际功率
  'ActivePower|e', //储能实际功率
]

// 整合统计图的数据 -> 针对能量单元查询设备-> 设备查询点号 ->点号查询值
export const mergeChartData = (pointNumber: any[], valueObj: any): { xData: string[], yData: any[][] } => {
  const xData = Array.from(new Set(Object.keys(valueObj).reduce((pre, key) => [...pre, ...valueObj[key].map(item => item.dtime)], []))).sort((a, b) => a && b && moment(a).isBefore(moment(b)) ? -1 : 1)
  return {
    xData: xData,
    yData: pointNumber.map(item => {
      return xData.map(xd => valueObj[item.pointNumber]?.find(vItem => vItem.dtime === xd)?.val?.toFixed(2) || 0)
    })
  }
}


// 光伏限电typeId对应的name
export const ENERGY_CONSUMPTION_CHART = [
  'PowerRationPlan|s', //限电计划  //TODO 需要提供
  'SolarOutput|s', //光伏可出力
  'SolarActivePower|s', //光伏功率
  'ActivePower|e', //储能功率
  'ActivePower|s', // 并网点总有功 //TODO 需要提供
]

// 手动控制typeId对应的name
export const MANUAL_CONTROL_CHART = [
  'ActivePower|se', //储能单元的有功功率
]

// 一次调频typeId对应的name
export const FIRST_FM_CHART = [
  'ActivePower|e', //储能功率
  'SystemFrequency|e', //  系统频率 
]

// 二次调频typeId对应的name
export const SECOND_FM_CHART = [
  'ActivePower|e', //储能功率
  'SolarActivePower|s', //光伏功率
]

// 手动控制的相关表单
export const getManualFormJson = (type = 1, form, { orderMap, socMap, controlMap, tableList }) => {
  if (type === 1) {
    return [
      {
        name: "name",
        title: "控制参数名称",
        rules: [{ required: true, message: "请输入控制参数名称" }, { max: 16, message: '输入的内容请不要超过16个字' }],
        component: <Input placeholder="请输入" />
      }
    ]

  } else if (type === 2) {
    return [
      {
        name: "order",
        title: "控制指令",
        rules: [{ required: true, message: "请选择控制指令" }],
        component: (
          <Select placeholder="请选择">
            {
              orderMap.map(item => (<Option value={item.id}>{item.name}</Option>))
            }
          </Select>
        )
      },
      {
        name: "startTime",
        title: "执行开始时间",
        rules: [
          { required: true, message: "请选择执行开始时间" },
          {
            validator: (_, value) => {
              // console.log('startTime', checkDateInList(tableList, { startTime: value, endTime: form.getFieldValue('endTime') }))
              if (form.getFieldValue('endTime') && form.getFieldValue('endTime').format('HH:mm:ss') === '00:00:00') {
                return Promise.resolve()
              } else if (form.getFieldError('endTime') && form.getFieldError('endTime').length) form.validateFields(['endTime'])
              return checkDateInList(tableList, { startTime: value, endTime: form.getFieldValue('endTime') }) ?
                Promise.reject('当前时间段与之前指令的执行时间有冲突， 请重新选择')
                : !form.getFieldValue('endTime') || form.getFieldValue('endTime') && (form.getFieldValue('endTime').isAfter(value) || value.format('HH:mm:ss') === form.getFieldValue('endTime').format('HH:mm:ss')) ?
                  Promise.resolve() : Promise.reject('请不要晚于结束时间')
            }
          },
        ],
        component: (
          <TimePicker style={{ width: '100%' }} minuteStep={15} secondStep={60} allowClear={false}/>
        )
      },
      {
        name: "endTime",
        title: "执行结束时间",
        rules: [
          { required: true, message: "请选择结束时间" },
          {
            validator: (_, value) => {
              // console.log('endTime', checkDateInList(tableList, {
              //   startTime: form.getFieldError('startTime'), endTime: value
              // }))
              if (value.format('HH:mm:ss') === '00:00:00') {
                return Promise.resolve()
              } else if (form.getFieldError('startTime') && form.getFieldError('startTime').length) form.validateFields(['startTime'])
              return checkDateInList(tableList, {
                startTime: form.getFieldValue('startTime'), endTime: value
              }) ?
                Promise.reject('当前时间段与之前指令的执行时间有冲突， 请重新选择') :
                !form.getFieldValue('startTime') || form.getFieldValue('startTime') && (form.getFieldValue('startTime').isBefore(value) || value.format('HH:mm:ss') === form.getFieldValue('startTime').format('HH:mm:ss')) ?
                  Promise.resolve() : Promise.reject('请不要早于开始时间')
            }
          }],
        component: (
          <TimePicker style={{ width: '100%' }} minuteStep={15} secondStep={60} allowClear={false}/>
        )
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.order !== currentValues.order,
        noStyle: true,
        component: ({ getFieldValue }) => {
          return getFieldValue('order') && getFieldValue('order') !== 3 ? (
            <Form.Item name="control" label="运行控制方式" rules={[{ required: true, message: "请选择运行控制方式" }]}>
              <Select placeholder="请选择">
                {
                  controlMap.map(item => (<Option value={item.id}>{item.name}</Option>))
                }
              </Select>
            </Form.Item>
          ) : null
        }
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.control !== currentValues.control,
        noStyle: true,
        component: ({ getFieldValue }) => {
          return getFieldValue('control') === 1 && getFieldValue('order') !== 3 ? (
            <Form.Item
              name="power"
              label="有功功率"
              rules={[
                { required: true, message: "请输入有功功率" },
                { pattern: /^[-\+]?([0-9]+.?)?[0-9]{1,2}$/, message: '请输入合适的数字，最多保留2位有效数字' },
                {
                  validator: (_, value) => {
                    if (parseFloat(value) !== NaN && parseFloat(value) >= 0 && parseFloat(value) <= 9999) {
                      return Promise.resolve()
                    }
                    return Promise.reject('有功功率的大小限制在[0,9999]之间')
                  }
                }
              ]}>
              <Input addonAfter="kW" placeholder="请输入" />
            </Form.Item>
          ) : null
        }
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.control !== currentValues.control || prevValues.order !== currentValues.order,
        noStyle: true,
        component: ({ getFieldValue }) => {
          const label = getFieldValue('order') === 1 ? '充电电流限值' : '放电电流'
          const addon = getFieldValue('order') === 1 ? 'C/AH' : 'A'
          return getFieldValue('control') === 2 && getFieldValue('order') !== 3 ? (
            <Form.Item
              name="currentLimit"
              label={label}
              rules={[
                { required: true, message: `请输入${label}` },
                { pattern: getFieldValue('order') === 1 ? /^[-\+]?([0-9]+.?)?[0-9]{1,4}$/ : /^[-\+]?([0-9]+.?)?[0-9]{1,2}$/, message: `请输入合适的数字, 最多${getFieldValue('order') === 1 ? 4 : 2}位小数` },
                {
                  validator: (_, value) => {
                    if (parseFloat(value) !== NaN && (getFieldValue('order') === 1 && parseFloat(value) >= 0 && parseFloat(value) <= 9 || getFieldValue('order') !== 1 && parseFloat(value) >= 0 && parseFloat(value) <= 9999)) {
                      return Promise.resolve()
                    }
                    return getFieldValue('order') === 1 ? Promise.reject('充电电流限值的大小限制在[0,9]之间') : Promise.reject('放电电流的大小限制在[0,9999]之间')
                  }
                }
              ]}>
              <Input addonAfter={addon} placeholder="请输入" />
            </Form.Item>
          ) : null
        }
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.control !== currentValues.control || prevValues.order !== currentValues.order,
        noStyle: true,
        component: ({ getFieldValue }) => {
          const label = getFieldValue('order') === 1 ? '充电电压' : '放电截止电压'
          return getFieldValue('control') === 2 && getFieldValue('order') !== 3 ? (
            <Form.Item
              name="voltageLimit"
              label={label}
              rules={[
                { required: true, message: `请输入${label}` },
                { pattern: /^[-\+]?([0-9]+.?)?[0-9]{1,2}$/, message: '请输入合适的数字，最多保留2位有效数字' },
                {
                  validator: (_, value) => {
                    if (parseFloat(value) !== NaN && parseFloat(value) >= 0 && parseFloat(value) <= 99) {
                      return Promise.resolve()
                    }
                    return Promise.reject(`${label}   的大小限制在[0,99]之间`)
                  }
                }
              ]}>
              <Input addonAfter='V/cell' placeholder="请输入" />
            </Form.Item>
          ) : null
        }
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.order !== currentValues.order,
        noStyle: true,
        component: ({ getFieldValue }) => {
          return getFieldValue('order') && getFieldValue('order') !== 3 ? (
            <Form.Item name="endControl" label="结束控制参数" rules={[{ required: true, message: "请选择结束控制参数" }]}>
              <Select placeholder="请选择">
                {
                  socMap.map(item => (<Option value={item.id}>{item.name}</Option>))
                }
              </Select>
            </Form.Item>
          ) : null
        }
      },
      {
        shouldUpdate: (prevValues, currentValues) => prevValues.order !== currentValues.order || prevValues.endControl !== currentValues.endControl,
        noStyle: true,
        component: ({ getFieldValue }) => {
          return getFieldValue('order') && getFieldValue('order') !== 3 && getFieldValue('endControl') === 1 ? (
            <Form.Item 
            name="soc" 
            label="SOC值" 
            rules={[
              { required: true, message: "请输入SOC值" }, 
              { pattern: /^[-\+]?([0-9]+.?)?[0-9]+$/, message: '请输入数字' },
              {
                validator: (_, value) => {
                  if (parseFloat(value) !== NaN && parseFloat(value) >= 0 && parseFloat(value) <= 100) {
                    return Promise.resolve()
                  }
                  return Promise.reject(`soc值的大小限制在[0,100]之间`)
                }
              }
            ]}>
              <Input addonAfter="%" placeholder="请输入" />
            </Form.Item>
          ) : null
        }
      },
    ]
  }
  return []
}

const yData = [ 30, 120, 80, 60, 150, 130, 90, 170, 200, 100, 10, 36, 100, 200, 162, 180, 87, 90, 65, 89, 32, 66, 100, 111 ]

// 判断一个时间段在之前的表格数据中是否重叠
export const checkDateInList = (tableList, { startTime, endTime }): boolean => {
  if (startTime && endTime) {
    // console.log(startTime,endTime)
    return tableList.some(item =>
      moment(moment(startTime).format('HH:mm:ss'), 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`), 's') && moment(moment(startTime).format('HH:mm:ss'), 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${item.startTime}`), 's')
      || moment(moment(endTime).format('HH:mm:ss'), 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`), 's') && moment(moment(endTime).format('HH:mm:ss'), 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${item.startTime}`), 's')
      || moment(moment(startTime).format('HH:mm:ss'), 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${item.startTime}`), 's') && moment(moment(endTime).format('HH:mm:ss'), 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${item.endTime}`), 's')

      || moment(item.startTime, 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm:ss')}`), 's') && moment(item.startTime, 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm:ss')}`), 's')
      || moment(item.endTime, 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm:ss')}`), 's') && moment(item.endTime, 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm:ss')}`), 's')
      || moment(item.startTime, 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${startTime.format('HH:mm:ss')}`), 's') && moment(item.endTime, 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${endTime.format('HH:mm:ss')}`), 's')
    )
  }else if (startTime){
    return tableList.some(item => moment(startTime, 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${item.startTime}`), 's') || moment(startTime, 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`)) && moment(startTime, 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${item.startTime}`), 's'))
  }
  const isTrue = tableList.some(item => moment(endTime, 'HH:mm:ss').isSame(moment().format(`YYYY-MM-DD ${item.endTime}`), 's') || moment(endTime.format('HH:mm:ss'), 'HH:mm:ss').isBefore(moment().format(`YYYY-MM-DD ${item.endTime}`), 's') && moment(endTime, 'HH:mm:ss').isAfter(moment().format(`YYYY-MM-DD ${item.startTime}`), 's'))
  return isTrue || false
}

// 随机生成数据
export const getChartData = (level = 1) => {
  const  result = {
    xData: new Array(24).fill(0).map((item, index) => moment(moment().format('YYYY-MM-DD 00:00:00')).add(index,'h').format('YYYY-MM-DD HH:mm:ss')),
    yData: []
  }

  for (let i=0; i<level; i++){
    // result.xData = new Array(5).fill(0).map((item, index) => moment().subtract(5-index,'d').format('YYYY-MM-DD'));
    result.yData[i] = yData.map(item => item * i);
  }
  return result

}