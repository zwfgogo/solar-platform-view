const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'microgrid',
  },
  routes: [
    {
      path: '/',
      component: './common-login/Login'
    },
    {
      path: '/uuid-login',
      component: './prompt-page/UuidLogin',
    },
    {
      path: '/',
      component: '../frameset/Platform21App',
      wrappers: ['../frameset/RouterHelper'],
      routes: [
        {
          path: '/index',
          component: './pv-station-monitor/index'
        },
        {
          path: '/operation-monitor',
          component: './common-operation-monitor',
        },
        {
          path: '/station-monitor',
          routes: [
            {
              path: '/station-monitor/diagram-video',
              component: './storage-diagram-video/Entry'
            },
            {
              path: '/station-monitor/real-data-query',
              component: './storage-station-monitor/real-data-query/index'
            },
            {
              path: '/station-monitor/history-data-query',
              component: './common-history-data-new/index'
            },
            {
              path: '/station-monitor/system-connect-line',
              component: './terminal-station-monitor/system-connect-line/Entry'
            },
            {
              path: '/station-monitor/operation-monitor',
              component: './common-operation-monitor'
            },
          ]
        },
        {
          path: '/situational-awareness',
          routes: [{
            path: '/situational-awareness/forecast',
            component: './pv-situational-awareness/index'
          }]
        },
        {
          path: '/power-load-management',
          routes: [
            {
              path: '/power-load-management/power-management',
              component: './microgrid-power-load-management/power-management/Entry'
            },
            {
              path: '/power-load-management/load-management',
              component: './microgrid-power-load-management/load-management/Entry'
            }
          ]
        },
        {
          path: '/monographic-analysis',
          routes: [
            {
              path: '/monographic-analysis/abnormal',
              component: './storage-topic-abnormal'
            },
            {
              path: '/monographic-analysis/electricity-form', // 电量报表
              component: './common-electricity-form'
            },
          ]
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
            path: '/basic-data/data-mock',
            component: './storage-data-mock/DataMock'
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
          },

          ]
        },
        {
          path: '/optimize-operation',
          routes: [
            {
              path: '/optimize-operation/control-strategy',
              component: './storage-run-strategy/Entry'
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
    }],
  title: '微电网云平台',
  proxy: {
    '/api/': {
      'target': 'http://192.168.3.28:3002/',
      'changeOrigin': true,
      'pathRewrite': { '^/api/': '' }
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
