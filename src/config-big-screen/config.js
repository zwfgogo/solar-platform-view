const umiConfig = {
  define: {
    'process.env.SYSTEM_PLATFORM': 'screen',
  },
  routes: [
    {
      path: '/',
      component: './common-login/Login'
    },
    {
      path: '/index',
      component: './big-screen/Screen'
    },
  ],
  title: '综合能源大屏',
  proxy: {
    '/api/': {
      'target': 'http://192.168.2.35:4060/',
      'changeOrigin': true,
      'pathRewrite': {
        '^/api/': ''
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
