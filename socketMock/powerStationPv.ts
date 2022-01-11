import moment from 'moment';

const getChartList = () => {
  const list = [];
  for(let i = 1; i < 30; i++) {
    list.push({ dtime: `2020/5/${i}`, val: Math.round(Math.random() * 100) })
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
  const results = {}
  list.forEach(id => {
    results[id.toString()] = {
      'generation': '5MWh',
      'revenue': '123445.3元',
      'irradiance': '7168MWh/㎡',
      'yield': '1.5h',
      'pr': '80.23%',
      'heartBeat': Math.round(Math.random() * 2),
      'activePower': '123.66kW',
    }
  });
  return results
}

export default {
  namespace: '/station-monitoring',
  events: {
    'real': {
      // emit之后返回的第一个数据
      init: (params) => ({
        results: getStationInfo(params?.stationIds)
      }),
      // 轮询返回的数据
      // loop: (index: number, params) => ({
      //   results: {}
      // }),
    },
    'curve': {
      timeout: 300000,
      init: (params) => ({
        results: {
          irradiance: getChartList(),
          power: getChartList(),
        }
      }),
      // loop: (index: number, params) => ({
      //   results: {
      //     irradiationIntensityAnalog: getNextList(index),
      //     power: getNextList(index),
      //   }
      // }),
    },
  }
}
