const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'battery',
  },
  routes: [{
    path: '/',
    component: './common-login/Login'
  },
  {
    path: '/',
    component: '../frameset/Platform21App',
    wrappers: ['../frameset/RouterHelper'],
    routes: [{
      path: '/battery-cabin',
      component: './battery-home'
    },
    {
      path: '/information-room',
      routes: [{
        path: '/information-room/informationRoom',
        component: './battery-information-room/informationRoom'
      },
      {
        path: '/information-room/roomDetail',
        component: './battery-room-detail/batteryDetailIndex'
      },
      {
        path: '/information-room/safe-assess', // 安全评估
        component: './battery-safe-assess'
      },
      {
        path: '/information-room/efficiency-analysis', // 效率分析
        component: './battery-efficiency-analysis'
      },
      {
        path: '/information-room/capacity-analysis', // 容量分析
        component: './battery-capacity-analysis'
      },
      {
        path: '/information-room/milestone-analysis', // 里程分析
        component: './battery-milestone-analysis'
      },
      ],
    },
    {
      path: '/battery-operation',
      component: './common-battery-operation/Entry'
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
        path: '/basic-data/equipment-ledger',
        component: './common-basic-station/StationEntry'
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
        path: '/basic-data/myfirm',
        component: './common-myfirm/index'
      },
      ]
    }
    ],
  },
  ],
  title: '电池健康管理系统',
  proxy: {
    '/api/': {
      // 'target': 'http://192.168.2.35:4060/',
      'target': 'http://192.168.2.122:3002/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api/': ''
      }
    },
    '/api-vpp/': {
      target: 'http://192.168.2.35:4056/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-vpp/': ''
      }
    },
    '/api-screen/': {
      target: 'http://192.168.2.35:5007/',
      changeOrigin: true,
      pathRewrite: {
        '^/api-screen/': ''
      }
    }
  }
}

export default umiConfig