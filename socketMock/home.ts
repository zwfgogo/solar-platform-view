import moment from 'moment';

function getSummaryItem(number, unit = '元') {
  if (unit == '元') {
    return {
      AUD: number * 10,
      CNY: number * 10,
    }
  }
  return number;
}

const summaryResults = {
  generationDay:getSummaryItem(1, 'kWh'),
  generationMonth:getSummaryItem(2, 'kWh'),
  generationYear:getSummaryItem(3, 'kWh'),
  generationAmount:getSummaryItem(4000, 'kWh'),
  profitDay: getSummaryItem(1, '元'),
  profitMonth: getSummaryItem(2, '元'),
  profitYear: getSummaryItem(3, '元'),
  profitAmount: getSummaryItem(4000, '元'),
  CO2Day: getSummaryItem(1, 'kg'),
  CO2Month: getSummaryItem(2, 'kg'),
  CO2Year: getSummaryItem(3, 'kg'),
  CO2Amount: getSummaryItem(4000, 'kg'),
}

const summaryResultsLoop = {
  generationDay:getSummaryItem(1, 'kWh'),
  generationMonth:getSummaryItem(1, 'kWh'),
  generationYear:getSummaryItem(1, 'kWh'),
  generationAmount:getSummaryItem(10000, 'kWh'),
  profitDay: getSummaryItem(1, '元'),
  profitMonth: getSummaryItem(1, '元'),
  profitYear: getSummaryItem(1, '元'),
  profitAmount: getSummaryItem(10000, '元'),
  CO2Day: getSummaryItem(1, 'kg'),
  CO2Month: getSummaryItem(1, 'kg'),
  CO2Year: getSummaryItem(1, 'kg'),
  CO2Amount: getSummaryItem(10000, 'kg'),
}

const getChartList = () => {
  const list = [];
  for(let i = 0; i < 96; i++) {
    const time = i * 15
    const hours = Math.floor(time / 60)
    // list.push({ dtime: `2020/8/24 ${hours%60}:${time%60}:00`, val: Math.round(Math.random() * 100) })
    list.push({ dtime: `2020/8/24 ${hours%60}:${time%60}:00`, val: Math.random() > 0.2 ? `10` : null, currency: 'CNY' })
    list.push({ dtime: `2020/8/24 ${hours%60}:${time%60}:00`, val: `10`, currency: 'AUD' })
  }
  console.log(list)
  return list
}

const getNextList = (index) => {
  console.log('index', index);
  const list = [];
  // list.push({ dtime: moment().add(index + 1, 'day').format('YYYY/MM/DD'), val: Math.round(Math.random() * 100) })
  list.push({ dtime: `2020/8/24 23:00:00`, val: `10`, currency: 'AUD' })
  return list
}

export default {
  namespace: '/overview',
  events: {
    'summary': {
      init: () => ({
        results: summaryResults
      }),
      loop: (index: number) => ({
        results: summaryResultsLoop
      })
    },
    'currency': {
      init: () => ({
        results: {
          AUD: 0.5,
          CNY: 1
        }
      }),
      delay: 2000
    },
    'abnormal': {
      init: () => ({
        results: {
          tip: 4,
          warning: 6,
          fault: 8
        }
      }),
      loop: (index: number) => ({
        results: {
          tip: 4,
          warning: 6,
          fault: 8
        }
      })
    },
    'electric': {
      timeout: 300000,
      init: (params) => ({
        results: {
          electricReal: getChartList(),
          electricTheory: getChartList(),
          mod: params.mod
        }
      }),
      loop: (index: number, params) => ({
        results: {
          electricReal: getNextList(index),
          electricTheory: getNextList(index),
          mod: params.mod
        }
      }),
    },
    'profit': {
      timeout: 300000,
      init: (params) => ({
        results: {
          profit: getChartList(),
          mod: params.mod
        }
      }),
      loop: (index: number, params) => ({
        results: {
          profit: getNextList(index),
          mod: params.mod
        }
      })
    },
    'PRRank': {
      init: (params) => ({
        results: {
          "PR": [
            {
              "value": 28,
              "name": "dz1"
            },
            {
              "value": 4,
              "name": "dz2"
            },
            {
              "value": 0,
              "name": "dz3"
            }
          ],
          mod: params.mod
        }
      }),
      // loop: (index: number, params) => ({
      //   results: {
      //     profit: getNextList(index),
      //     mod: params.mod
      //   }
      // })
    },
    'timeRank': {
      init: (params) => ({
        results: {
          "time": [
            {
              "value": 15511,
              "name": "dz1"
            },
            {
              "value": 5101,
              "name": "dz2"
            },
            {
              "value": 0,
              "name": "dz3"
            }
          ],
          mod: params.mod
        }
      }),
      // loop: (index: number, params) => ({
      //   results: {
      //     profit: getNextList(index),
      //     mod: params.mod
      //   }
      // })
    },
  }
}
