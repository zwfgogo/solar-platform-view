const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'pv',
  },
  routes: [{
    path: '/',
    component: './common-login/Login'
  },
  {
    path: '/screen',
    component: './big-screen/Screen'
  },
  {
    path: '/uuid-login',
    component: './prompt-page/UuidLogin',
  },
  {
    path: '/',
    component: '../frameset/Platform21App',
    wrappers: ['../frameset/RouterHelper'],
    routes: [{
      path: '/index',
      component: './pv-index/Home'
    },
    {
      path: '/station-monitor',
      routes: [{
        path: '/station-monitor/index',
        component: './pv-station-monitor/index'
      },
      {
        path: '/station-monitor/system-connect-line',
        component: './terminal-station-monitor/system-connect-line/Entry',
      },
      {
        path: '/station-monitor/data-analysis',
        component: './common-history-data-new/index'
      },
      {
        path: '/station-monitor/indicator-analysis',
        component: './common-indicator-analysis/index'
      },
      {
        path: '/station-monitor/station_monitor',
        component: './monitoring/station-monitor/index'
      }, {
        path: '/station-monitor/topological',
        component: './pv-topological-analysis/topological'
      }, {
        component: './pv-topological-analysis/topologicalList/index'
      }, {
        component: './pv-topological-analysis/topologicalDetail/index'
      },

      ]
    },
    {
      path: '/statistical-form',
      routes: [{
        path: '/statistical-form/station-form',
        component: './pv-statistical-form/station-form/StationForm'
      },
      {
        path: '/statistical-form/device-form',
        component: './pv-statistical-form/device-form/DeviceForm'
      },
      ]
    },
    {
      path: '/customized-service',
      routes: [{
        path: '/customized-service/remind-management',
        component: './pv-remind-management/RemindEntry'
      }, {
        path: '/customized-service/lgc-management',
        component: './pv-lgc-management/index'
      },]
    },
    {
      path: '/topological-analysis',
      routes: [{
        path: '/topological-analysis/topological',
        component: './pv-topological-analysis/topological'
      }, {
        component: './pv-topological-analysis/topologicalList/index'
      }, {
        component: './pv-topological-analysis/topologicalDetail/index'
      }]
    },
    {
      path: '/operation',
      routes: [{
        path: '/operation/power_management',
        component: './operations_management/energy_management'
      }, {
        path: '/operation/load_management',
        component: './operations_management/load_management'
      }, {
        path: '/operation/energy_detail',
        component: './operations_management/energy_detail'
      }, {
        path: '/operation/load_detail',
        component: './operations_management/load_detail'
      }]
    },
    {
      path: '/operation-maintenance',
      routes: [{
        path: '/operation-maintenance/dispatch',
        component: './common-maintenance-dispatch/index'
      }, {
        path: '/operation-maintenance/work-order',
        component: './common-maintenance-operation-deal/index'
      }, {
        path: '/operation-maintenance/abnormal',
        component: './common-maintenance-check-abnormal/index'
      }, {
        path: '/operation-maintenance/run-analysis',
        component: './common-maintenance-run-record/index'
      }, {
        path: '/operation-maintenance/electricity-difference',
        component: './common-maintenance-electric-difference/index'
      }, {
        path: '/operation-maintenance/defect',
        component: './common-maintenance-defect-record/index'
      }, {
        path: '/operation-maintenance/duty',
        component: './common-maintenance-workspace/WorkSpace'
      }, {
        path: '/operation-maintenance/level',
        component: './common-maintenance-abnormal-warning/index'
      }, {
        path: '/operation-maintenance/notification',
        component: './common-maintenance-alarm-notification/index'
      }]
    },
    {
      path: '/alert-service',
      routes: [{
        path: '/alert-service/abnormal',
        component: './common-maintenance-check-abnormal/index'
      }, {
        path: '/alert-service/level',
        component: './common-maintenance-abnormal-warning/index'
      }, {
        path: '/alert-service/notification',
        component: './common-maintenance-alarm-notification/index'
      }]
    },
    {
      path: '/situational-awareness',
      routes: [{
        path: '/situational-awareness/forecast',
        component: './pv-situational-awareness/index'
      }]
    },
    {
      path: '/basic-data',
      routes: [{
        path: '/basic-data/acquisition-configuration', // 采集点号配置
        component: './common-acquisition-configuration/index',
      },
      {
        path: '/basic-data/device-management-twice', // 二次设备管理
        component: './common-device-management-twice/Entry',
      },
      {
        path: '/basic-data/strategy-control',
        component: './storage-optimize/OptimizeEntry'
      },
      {
        path: '/basic-data/myfirm',
        component: './common-myfirm/index'
      },
      {
        path: '/basic-data/customer',
        component: './common-basic-customer/CustomerEntry'
      },
      {
        path: '/basic-data/equipment-ledger',
        component: './common-basic-station/StationEntry'
      },
      {
        path: '/basic-data/iot-controller',
        component: './common-iot-controller/iotEntry'
      },
      {
        path: '/basic-data/user-authority',
        component: './common-basic-user/RightsUserEntry'
      },
      {
        path: '/basic-data/role-authority',
        component: './common-basic-role/RightsRoleEntry'
      },
      {
        path: '/basic-data/data-mock',
        component: './storage-data-mock/DataMock'
      },
      {
        path: '/basic-data/electricity-price',
        component: './common-basic-price/price'
      }, {
        path: '/basic-data/electricity-price/Detail',
        component: './common-basic-price/priceUser/priceDetail/index'
      }, {
        path: '/basic-data/electricity-price/Edit',
        component: './common-basic-price/priceUser/priceEdit/index'
      }, {
        path: '/basic-data/modelConfig',
        component: './common-basic-model/ModelConfig'
      }, {
        component: './common-basic-model/deviceModel/Index'
      }, {
        component: './common-basic-model/stationModel/Index'
      }, {
        component: './common-basic-model/energyUnitModel/Index'
      }, {
        component: './common-basic-model/deviceParameter/Index'
      }, {
        component: './common-basic-model/batch-addition/BatchAddition'
      }, {
        component: './common-basic-model/data-item-view/DataItemView'
      }, {
        component: './common-basic-model/parameter-library/ParameterLibrary'
      }, {
        component: './common-basic-model/contentType/Index'
      },
      {
        component: './common-basic-price/pricePower/index'
      },
      {
        component: './common-basic-price/priceUser/priceUserList/PriceUserList'
      },
      {
        component: './common-basic-price/index'
      }
      ]
    },
    // 新增的路由
    {
      path: '/abnormal-alarm',
      routes: [
        {
          path: '/abnormal-alarm/level-config-admin', // 级别配置-运营商管理员
          component: './common-abnormal-alarm/LevelConfigAdmin'
        },
        {
          path: '/abnormal-alarm/abnormal',
          component: './common-maintenance-check-abnormal/index'
        },
        {
          path: '/abnormal-alarm/level-config-user', // 级别配置-普通用户
          component: './common-abnormal-alarm/LevelConfigUser'
        },
        {
          path: '/abnormal-alarm/alarm-types', // 异常类型配置
          component: './common-abnormal-alarm/AlarmTypes'
        },
        {
          path: '/abnormal-alarm/alarm-rules', // 异常规则配置
          component: './common-abnormal-alarm/AlarmRules'
        },
      ]
    }
    ]
  }
  ],
  title: false,
  proxy: {
    '/api/': {
      // 'target': 'http://192.168.3.28:3002/',
      'target': 'http://192.168.3.122:3002/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api/': ''
      }
    },
    '/api-vpp/': {
      target: 'http://192.168.3.28:3002/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-vpp/': ''
      }
    },
    '/api-screen/': {
      target: 'http://192.168.3.28:3002/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-screen/': ''
      }
    },
    '/api-terminal/': {
      'target': 'http://192.168.3.28:4002/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api-terminal/': ''
      }
    }
  }
}

export default umiConfig