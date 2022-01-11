export default function mock(data) {
  return new Promise((resolve, reject) => {
    resolve(data)
  })
}

export const mockControlArgumentList = [
  {
    'id': 0,
    'title': '夏季运行策略',
    'applicableDateType': {
      'id': 1,
      'name': 'NaturalDay',
      'title': '自然日'
    },
    'applicableDate': [['01-01', '06-01'], ['06-01', '12-31']],
    'status': 1 //0 暂停执行，1 正在执行
  }
]

export const mockNotSendArgumentList = [
  {
    'id': 0,
    'title': '夏季运行策略',
    'applicableDateType': {
      'id': 1,
      'name': 'NaturalDay',
      'title': '自然日'
    },
    'applicableDate': [['01-01', '06-01'], ['06-01', '12-31']],
    'status': 0,
    detail: [
      {
        'startTime': '00:00:00',
        'endTime': '06:00:00',
        'controlCommand': {//控制指令
          'id': 1,
          'name': 'Charge',
          'title': '充电'
        },
        'controlMode': {//控制方式
          'id': 2,
          'name': 'Power',
          'title': '功率'
        },
        'activePower': 0,//有功功率
        'chargeCurrentLimit': 0,//充电电流限值
        'chargeVoltage': 0,//充电电压
        'dischargeCurrent': 0,//放电电流
        'dischargeEndVoltage': 0,//放电截止电压
        'endControlParam': {//结束控制参数
          'id': 3,
          'name': 'SOC',
          'title': 'SOC'
        },
        'soc': 0,//SOC
        'energyUnitId': 111//能量单元ID
      }
    ]
  }
]
export const mockTodayCommandList = [
  {
    'id': 0,
    'startTime': '00:00:00',
    'endTime': '08:00:00',
    'controlCommand': {//控制指令
      'id': 1,
      'name': 'Charge',
      'title': '充电'
    },
    'controlMode': {//控制方式
      'id': 2,
      'name': 'Power',
      'title': '功率'
    },
    'activePower': 0,//有功功率
    'chargeCurrentLimit': 0,//充电电流限值
    'chargeVoltage': 0,//充电电压
    'dischargeCurrent': 0,//放电电流
    'dischargeEndVoltage': 0,//放电截止电压
    'endControlParam': {//结束控制参数
      'id': 3,
      'name': 'SOC',
      'title': 'SOC'
    },
    'soc': 0,//SOC
  },

]
export const mockCurrentCommandList = [
  {
    'startTime': '00:00:00',
    'endTime': '06:00:00',
    'controlCommand': {//控制指令
      'id': 1,
      'name': 'Charge',
      'title': '充电'
    },
    'controlMode': {//控制方式
      'id': 2,
      'name': 'Power',
      'title': '功率'
    },
    'activePower': 0,//有功功率
    'chargeCurrentLimit': 0,//充电电流限值
    'chargeVoltage': 0,//充电电压
    'dischargeCurrent': 0,//放电电流
    'dischargeEndVoltage': 0,//放电截止电压
    'endControlParam': {//结束控制参数
      'id': 3,
      'name': 'SOC',
      'title': 'SOC'
    },
    'soc': 0,//SOC
    'energyUnitId': 111//能量单元ID
  }
]

export const mockTempCommandList = [
  {
    'id': 0,
    'startTime': '2021-01-01 00:00:00',
    'endTime': '2021-06-01 00:00:00',
    'runTime': ['00:00:00', '06:00:00'],
    'controlCommand': {//控制指令
      'id': 1,
      'name': 'Charge',
      'title': '充电'
    },
    'controlMode': {//控制方式
      'id': 2,
      'name': 'Power',
      'title': '功率'
    },
    'activePower': 0,//有功功率
    'chargeCurrentLimit': 0,//充电电流限值
    'chargeVoltage': 0,//充电电压
    'dischargeCurrent': 0,//放电电流
    'dischargeEndVoltage': 0,//放电截止电压
    'endControlParam': {//结束控制参数
      'id': 3,
      'name': 'SOC',
      'title': 'SOC'
    },
    'soc': 0,//SOC
    'status': 1,//执行状态，0 未开始，1 执行中，2 已完成，3 已停用
    'statusTime': '2021-01-01 00:00:00'
  },
]
