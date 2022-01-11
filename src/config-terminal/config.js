const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'terminal',
  },
  routes: [
    {
      path: '/',
      component: './common-login/Login',
    },
    {
      path: '/no-station',
      component: './prompt-page/NoStation',
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
        component: './terminal-index/index',
      },
        {
          path: '/fm-monitoring',
          component: './terminal-fm-monitoring/index',
        },
        {
          path: '/online-monitor',
          routes: [{
            path: '/online-monitor/diagram',
            component: './terminal-station-monitor/1-1-diagram/Diagram',
          },
            {
              path: '/online-monitor/benefit-monitor',
              component: './terminal-station-monitor/1-4-benefit-monitor/BenefitMonitor',
            },
            {
              path: '/online-monitor/battery-monitor',
              component: './terminal-station-monitor/1-5-battery-monitor/BatteryMonitor',
            },
            {
              path: '/online-monitor/video-monitor',
              component: './terminal-station-monitor/videoMonitor/videoMonitor',
            },
            {
              path: '/online-monitor/system-connect-line',
              component: './terminal-station-monitor/system-connect-line/Entry',
            },
          ],
        },
        {
          path: '/operationDuty',
          routes: [{
            path: '/operationDuty/checkAbnormal',
            component: './common-maintenance-check-abnormal/index',
          },
            {
              path: '/operationDuty/abnormalWarning',
              component: './common-maintenance-abnormal-warning/index',
            },
          ]
        },
        {
          path: '/analysis-query',
          routes: [{
            path: '/analysis-query/fee-query',
            component: './common-operation-fee-query/Entry'
          },
            {
              path: '/analysis-query/data-query',
              component: './common-run-data-query/RunData'
            },
            {
              path: '/analysis-query/FM-performance',
              component: './terminal-analysis-query/FM-performance'
            },
            {
              path: '/analysis-query/command-output',
              component: './terminal-analysis-query/command-output'
            },
            {
              path: '/analysis-query/benefit',
              component: './common-topic-benefit/benefitEntry'
            },
            {
              path: '/analysis-query/battery',
              component: './common-topic-battery/battery'
            },
            {
              path: '/analysis-query/investigation',
              component: './terminal-analysis-query/investigation/investigation'
            }, {
              component: './terminal-analysis-query/investigation/basicData/index'
            }, {
              component: './terminal-analysis-query/investigation/detailData/index'
            },
          ]
        }
      ],
    }
  ],
  title: false,
  proxy: {
    '/api/': {
      'target': 'http://localhost:3002/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api/': ''
      },
    },
  },
}

export default umiConfig
