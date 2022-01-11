const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'storage',
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
      path: '/test-connect-graph',
      component: './test-connect-graph',
    },
    {
      path: '/svg-test',
      component: './test-connect-graph',
    },
    {
      path: '/',
      component: '../frameset/Platform21App',
      wrappers: ['../frameset/RouterHelper'],
      routes: [
        {
          path: '/index',
          component: './storage-index/Home'
        },
        {
          path: '/station-monitor',
          routes: [
            {
              path: '/station-monitor/diagram-video',
              component: './storage-diagram-video/Entry'
            },
            {
              path: '/station-monitor/index',
              component: './pv-station-monitor/index/entry'
            },
            {
              path: '/station-monitor/real-data-query',
              component: './storage-station-monitor/real-data-query/index'
            },
            {
              path: '/station-monitor/soe-query',
              component: './storage-station-monitor/soe-query/index'
            },
            {
              path: '/station-monitor/history-data-query',
              component: './common-history-data-new/index'
            },
            {
              path: '/station-monitor/battery-monitor',
              component: './storage-station-monitor/1-5-battery-monitor/BatteryMonitor',
            },
            {
              path: '/station-monitor/data-analysis',
              component: './common-run-data-query/RunData'
            },
            {
              path: '/station-monitor/station_monitor',
              component: './monitoring/station-monitor/index'
            },
            {
              path: '/station-monitor/system-connect-line',
              component: './terminal-station-monitor/system-connect-line/Entry'
            },
            {
              path: '/station-monitor/flow-connect-line',
              component: './terminal-station-monitor/system-connect-line/FlowEntry'
            }
          ]
        },
        {
          path: '/monographic-analysis',
          routes: [
            {
              path: '/monographic-analysis/electricity-charge-discharge',
              component: './storage-charge-discharge'
            },
            {
              path: '/monographic-analysis/efficiency-analysis',
              component: './storage-efficiency-analysis/benefitEntry'
            },
            {
              path: '/monographic-analysis/abnormal',
              component: './storage-topic-abnormal'
            },
            {
              path: '/monographic-analysis/power-quality',
              component: './storage-topic-power-quality/PowerQualityEntry'
            },
            {
              path: '/monographic-analysis/benefit',
              component: './common-topic-benefit/benefitEntry'
            },
            {
              path: '/monographic-analysis/income',
              component: './storage-income-analyse'
            },
            {
              path: '/monographic-analysis/battery',
              component: './common-topic-battery/battery'
            },
            {
              path: '/monographic-analysis/overview',
              component: './storage-vpp-overview'
            },
            {
              path: '/monographic-analysis/FM-performance',
              component: './terminal-analysis-query/FM-performance'
            },
            {
              path: '/monographic-analysis/command-output',
              component: './terminal-analysis-query/command-output'
            },
            {
              path: '/monographic-analysis/investigation',
              component: './terminal-analysis-query/investigation/investigation'
            }, {
              component: './terminal-analysis-query/investigation/basicData/index'
            }, {
              component: './terminal-analysis-query/investigation/detailData/index'
            },
            {
              path: '/monographic-analysis/vpp',
              component: './vpp/Vpp'
            }, {
              component: './vpp/vppList/index'
            }, {
              component: './vpp/vppAdd/index'
            }, {
              component: './vpp/vppMonitor/index'
            }, {
              component: './vpp/vppEchartDetail/index'
            }, {
              component: './vpp/vppRecord/index'
            }, {
              component: './vpp/vppRecordDetail/index'
            },

          ]
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
          path: '/operation-management',
          routes: [
            {
              path: '/operation-management/electricity-bill',
              component: './common-operation-fee-query/Entry'
            },
            {
              path: '/operation-management/analysis-day',
              component: './storage-operation-day-report/Entry'
            },
            {
              path: '/operation-management/quota-config',
              component: './common-operation-configuration/index'
              // component: './storage-operation-indicator-config/IndicatorConfig'
            }
          ]
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
          }
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
        {
          path: '/fm-monitoring',
          component: './terminal-fm-monitoring/index',
        },
        // {
        //   path: '/operation-configuration', // 运营指标配置
        //   component: './common-operation-configuration/index',
        // },
        // {
        //   path: '/basic-data/acquisition-configuration', // 采集点号配置
        //   component: './common-acquisition-configuration/index',
        // },
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
  title: '综合能源智慧运营服务平台',
  proxy: {
    '/api/': {
      'target': 'http://192.168.3.28:3002/',
      'changeOrigin': true,
      'pathRewrite': { '^/api/': '' }
    },
    '/api-vpp/': {
      target: 'http://192.168.3.28:3002/',
      changeOrigin: true,
      pathRewrite: { '^/api-vpp/': '' }
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
