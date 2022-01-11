import moment from 'moment';

const getChartList = (index) => {
  const list = [];
  for(let i = 0; i < 24; i++) {
    const hour = ('00' + i).slice(-2)
    for(let j = 0; j < 60; j += 1) {
      const minute = ('00' + j).slice(-2)
      list.push({ dtime: `2020/5/1 ${hour}:${minute}:00`, val: Math.round(Math.random() * 100) })
    }
  }
  return list
}

const getNextList = (index) => {
  console.log('index', index);
  const list = [];
  list.push({ dtime: moment().add(index + 1, 'day').format('YYYY/MM/DD'), val: Math.round(Math.random() * 100) })
  return list
}

const getStationInfo = (ids = '') => {
  const list = ids.split(',')
  const chartsList = ['Current', 'Voltage', 'ActivePower', 'SOC']
  const results = {}
  chartsList.forEach((key, index) => {
    results[key] = {}
    list.forEach(id => {
      results[key][id.toString()] = getChartList(index)
    });
  })
  return results
}

export default {
  namespace: '/measurements',
  events: {
    'runningData': {
      // emit之后返回的第一个数据
      init: (params) => getStationInfo(params?.deviceIds),
      // 轮询返回的数据
      // loop: (index: number, params) => ({
      //   results: {}
      // }),
    },
  }
}
