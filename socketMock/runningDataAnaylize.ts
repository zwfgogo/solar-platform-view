const getChartList = () => {
  const list = [];
  for(let i = 1; i < 30; i++) {
    list.push({ dtime: `2020/5/${i}`, val: Math.round(Math.random() * 100) })
  }
  return list
}

export default {
  namespace: '/operational-data-analysis',
  events: {
    'stationMonth': {
      // emit之后返回的第一个数据
      init: (params) => {
        const results = {}
        if(params.dataTypeNames) {
          const a = ['a', 'b', 'c']
          a.map(item => {
            results[`${item}`] = getChartList()
          })
        } else {
          if(params.stationIds) {
            params.stationIds.split(',').forEach(item => {
              let key = `${item}_`
              key = `${key}${params.indicators}`
              results[key] = getChartList()
            })
          }
          if(params.deviceIds) {
            params.deviceIds.split(',').forEach(item => {
              let key = `${item}_`
              key = `${key}${params.indicators}`
              results[key] = getChartList()
            })
          }
        }
        return {
          results
        }
      },
      // 轮询返回的数据
      // loop: (index: number, params) => ({
      //   results: {}
      // }),
      timeout: 10000, // 轮询间隔 非必填
      delay: 500, // 触发事件延时 非必填
    },
    'device': {
      // emit之后返回的第一个数据
      init: (params) => {
        const results = {}
        if(params.dataTypeNames) {
          const a = ['a', 'b', 'c']
          a.map(item => {
            results[`${item}`] = getChartList()
          })
        } else {
          if(params.stationIds) {
            params.stationIds.split(',').forEach(item => {
              let key = `${item}_`
              key = `${key}${params.indicators}`
              results[key] = getChartList()
            })
          }
          if(params.deviceIds) {
            params.deviceIds.split(',').forEach(item => {
              let key = `${item}_`
              key = `${key}${params.indicators}`
              results[key] = getChartList()
            })
          }
        }
        return {
          results
        }
      },
      // 轮询返回的数据
      // loop: (index: number, params) => ({
      //   results: {}
      // }),
      timeout: 10000, // 轮询间隔 非必填
      delay: 500, // 触发事件延时 非必填
    },
  }
}