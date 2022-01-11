import moment from 'moment'

const data = {
  date: {
    'today': moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
  },
  colors: [
    '#c700df',
    '#3148f5',
    '#08ba9e',
    '#2dff3c',
    '#ff6622',
    '#ff0700',
    '#003457',
    '#00b9d1',
    '#00ff89',
    '#00581f',
    '#523100',
    '#ff6436',
    '#8400ff',
    '#008a6e',
    '#003b6e',
    '#fdff2f'
  ],
  echartThemes: {
    'space-gray': {
      axisLineColor: '#2e323d',//y轴分割线颜色
      axisTextColor: '#fff',//x、y轴字体颜色
      yUnitColor: '#fff' //y轴单位颜色
    },
    'mint-green': {
      axisLineColor: '#efefef',//y轴分割线颜色
      axisTextColor: '#000',//x、y轴字体颜色
      yUnitColor: '#000' //y轴单位颜色
    },
    'slate-blue': {
      axisLineColor: '#efefef',//y轴分割线颜色
      axisTextColor: '#000',//x、y轴字体颜色
      yUnitColor: '#000' //y轴单位颜色
    }
  }
}
export default function(name?: string) {
  if (arguments.length === 1) {
    return data[arguments[0]]
  } else {
    data[arguments[0]] = arguments[1]
    return data
  }
}
