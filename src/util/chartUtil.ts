import * as d3 from 'd3'
import { dateFormat } from './dateUtil'


const colorArray = [
  '#0062ff', '#3dd598', '#ffb076', '#fc5a5a', '#a461d8', '#50b5ff', '#ff9ad5', '#ffc542', '#61a0a8', '#d48265',
  '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
]

export function getColor(count: number, index: number) {
  let color
  if (count <= 2) {
    if (index == 0) {
      color = '#e84f68'
    } else {
      color = '#3ebedb'
    }
  } else if (index < colorArray.length) {
    color = colorArray[index]
  } else {
    color = '#000000'
  }
  return d3.color(color).rgb().toString()
}

export function getColorDefault(count: number, index: number) {
  let color
  if (index < colorArray.length) {
    color = colorArray[index]
  } else {
    color = '#000000'
  }
  return d3.color(color).rgb().toString()
}

export function checkSingleDay(xData) {
  if (xData.length < 2) {
    return false
  }
  let start = new Date(xData[0])
  let end = new Date(xData[xData.length - 1])
  if (start.getFullYear() != end.getFullYear()) {
    return false
  }
  if (start.getMonth() != end.getMonth()) {
    return false
  }
  if (start.getDate() != end.getDate()) {
    return false
  }
  return true
}

export function getMaxY(yData, hidedLineArray) {
  if (!yData) {
    return null
  }
  let maxY = 0
  for (let i = 0; i < yData.length; i++) {
    if (hidedLineArray.indexOf(i) != -1) {
      continue
    }
    let data = yData[i].filter(y => y != null)
    let max = Math.max(...data)
    if (max > maxY) {
      maxY = max
    }
  }
  return maxY
}

export function getMinY(yData, hidedLineArray) {
  if (!yData || yData.length == 0) {
    return null
  }
  let minY = null
  for (let i = 0; i < yData.length; i++) {
    if (hidedLineArray.indexOf(i) != -1) {
      continue
    }
    let data = yData[i].filter(y => y !== null && y !== undefined)
    if (data.length == 0) {
      continue
    }
    let min = Math.min(...data)
    if (minY == null || min < minY) {
      minY = min
    }
  }
  if (typeof minY == 'number' && minY > 0) {
    minY = 0
  }
  return minY
}

function nice(time) {
  return Math.floor(time / 1000 / 60) * 60 * 1000
}

export function getTickValues(scale, domain, range, ticks = 10) {
  let left = nice(scale.invert(range[0]))
  let right = nice(scale.invert(range[1]))
  let leftRightRange = (right - left) / 1000
  let interval = Math.ceil(leftRightRange / ticks)
  let count = Math.ceil((domain[1] - domain[0]) / 1000 / interval)

  if (interval / 86400 > 0.5) {
    interval = Math.ceil(interval / 86400) * 86400
  } else if (interval > 3600) {
    interval = Math.ceil(interval / 3600) * 3600
  } else if (interval > 1800) {
    interval = Math.ceil(interval / 1800) * 1800
  } else if (interval > 900) {
    interval = Math.ceil(interval / 900) * 900
  } else if (interval > 600) {
    interval = Math.ceil(interval / 600) * 600
  } else if (interval > 300) {
    interval = Math.ceil(interval / 300) * 300
  } else if (interval > 60) {
    interval = Math.ceil(interval / 60) * 60
  }

  let tickValues = d3.range(count).map(item => {
    return item * interval * 1000 + domain[0]
  })
  return tickValues.filter(item => {
    return item >= left && item <= right
  })
}

export function getChartOption(options, isSingleDay, width, ticks) {
  let newOptions = options
  if (!newOptions.dateFormat) {
    newOptions = {
      ...newOptions,
      dateFormat: dateFormat(isSingleDay)
    }
  }
  if (!newOptions.ticks) {
    newOptions = {
      ...newOptions,
      ticks
    }
  }
  return newOptions
}
