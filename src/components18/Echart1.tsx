import React, { Component } from 'react'
import * as echarts from 'echarts'
import Loader from './Loader'
import Config from '../core18/config18'
import { openDownloadDialog, sheet2blob, loopReqChart, delLoopReq } from '../core18/utils18'
import XLSX from 'xlsx'
import Services from './chart/chart'
import * as utils18 from '../core18/utils18'
import echartDataGenerator from './chart/generate'
import gdata from '../core18/gdata'

class Echart extends Component<any, any> {
  chartbox: React.RefObject<any>

  constructor(props) {
    super(props)
    let echartThemes = gdata('echartThemes')[props.theme]
    this.state = {
      ifRender: true,
      title: '',//是否需要一个标题，默认是空
      xName: '',//X轴名字
      yName: '',//y轴名字
      unit: '',//单位
      ySplitLine: this.props.yAxisLineShow ? false : true,//是否显示y轴分割线
      legendShow: true,//是否显示图例
      axisLineColor: '#92929d',//x、y轴分割线颜色
      axisTextColor: '#92929d',//x、y轴字体颜色
      yUnitColor: '#000', //y轴单位颜色
      defaultSeries: {
        name: 'test', //线条名称
        type: 'bar',  //线条类型
        width: props.defaultLineWidth || 2,     //线条粗细
        color: '#000'//线条颜色
      },
      xData: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      yData: [[6, 7, 9, 3, 6, 7, 11, 4, 7], [7, 8, 9, 4, 5, 6, 7, 8, 9]],
      postData: {},
      loader: true,
      interval: Config.timer,
      selfReload: false,
      isCheckName: '',
      lastData: {},
      color: props.color ? props.color : ['#08ba9e', '#31d6f5', '#e84f68', '#c652cb', '#f29e79', '#7ff041', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      legendSign: props.legendChange,
      theme: props.theme,
      ...echartThemes
    }
    const {getInstance} = props
    if (typeof getInstance === 'function') {
      getInstance(this) // 在这里把this暴露给`parentComponent`
    }
    this.chartbox = React.createRef()
  };

  //激活自适应
  activeResize = (chartObj) => {
    if (window.onresizeArr) {
      window.onresizeArr.push(chartObj.resize)
    } else {
      window.onresizeArr = []
      window.onresizeArr.push(chartObj.resize)
    }
    window.onresize = function() {
      for (let i in window.onresizeArr) {
        window.onresizeArr[i]()
      }
    }
  }
  //导出

  outputExcelNew1 = (date) => {
    let dataResults = this.state.xData.map((v, h) => {
      let json = {'时间': date + ' ' + v}
      for (let i = 0; i < this.state.legend.length; i++) {
        json[this.state.legend[i]] = Array.isArray(this.state.yData[i][h]) ? this.state.yData[i][h][1] : this.state.yData[i][h]
      }
      return json
    })

    let filterArr = ['时间', ...this.state.legend]

    let sheet = XLSX.utils.json_to_sheet(dataResults, {header: filterArr})
    openDownloadDialog(sheet2blob(sheet, 'sheet1', filterArr), '导出.xlsx')

  }
  //构建echrt参数
  setEcharts = (resc, sign?) => {
    if (sign) {
      this.setState({echartsData: resc})
    }
    let showName = this.props.showName
    let types = []
    let props = {...this.props}
    let normalIndex = this.props.normalIndex || []
    let extendIndex = this.props.extendedIndex || []
    let extendName = this.props.extendedName || []
    let res: any = {}
    if (sign) {
      res.data = resc
    } else {
      res = resc
    }
    this.setState({legend: res.data.legend});
    let mixSign;
    if (JSON.stringify(res.data) === '{}'){
        res.data.results = [];
    }else {
        mixSign = res.data.timeInterval.includes(1) && res.data.timeInterval.includes(15)
    }
    let val = res.data.results.map((v, i) => {
      return echartDataGenerator(res.data.results[i], this.props.startTime, this.props.endTime, this.props.typeTime, res.data.timeInterval[i], this.props.valueType ? this.props.valueType : 'val', mixSign, this.props.dateVisible ? true : false, res.data.xData ? res.data.xData : false)
    })
    if (this.props.onlyOne && val.length > 1) {
      val = [val[0]]
    }
    let xData = []
    if (res.data.xData) {
      xData = res.data.xData
    } else {
      if (res.data.flag) {
        xData = val.map(v => {
          return v.yData.map(h => {
            return h[0]
          })
        })[0]
      } else {
        if (!mixSign) {
          xData = val[0] ? val[0].xData : []
        } else {
          let number = []
          val.forEach(v => {
            if (v.xData.length > number.length) {
              number = v.xData
            }
          })
          xData = number
        }
      }
    }
    let yData = []
    if (res.data.xData) {
      yData = val.map(v => {
        return v.yData.map(v => {
          return v
        })
      })
    } else {
      if (res.data.flag) {
        yData = val.map(v => {
          return v.yData.map(v => {
            if (this.props.typeTime === 'minute') {
              return v[1]
            } else {
              return v[1]
            }
          })
        })
      } else {
        yData = val.map(arr => {
          return arr.yData.map((v, i) => {
            if (this.props.typeTime === 'minute' || this.props.typeTime === 'second') {
              return [(arr.yDataIndex)[v[0]], v[1]]
            } else {
              return [xData.indexOf(v[0].split(' ')[0]), v[1]]
            }
          })
        })

        if (this.props.continue) {
          yData = yData.map((v, i) => {

            return val[i]['xData'].map((h, k) => {
              for (let c = 0; c < v.length; c++) {
                if (v[c][0] === k) {
                  return v[c]
                }

              }
              return [k, '']
            })
          })
        }

      }
    }

    if (!yData && props.changeVisible) {
      props.changeVisible()
      return
    }

    types = Array.isArray(this.props.types) ? this.props.types : []
    this.setState({types: types})
    const resDataLen = res.data.results ? res.data.results.length : 0
    let notMerge = resDataLen !== this.state.yDataLength
    this.setState({
      xData: xData,
      yData: yData || [],
      loader: false,
      yDataLength: resDataLen,
      isCheckName: ''
    })
    const state = this.state
    const currentOptions = {...state, ...props.options, xData: xData, yData: yData || []}
    currentOptions.series = res.data.results.map((v, i) => {
      let legend = ''
      if (typeof res.data.legend === 'string') {
        legend = res.data.legend
      } else if (res.data.legend && res.data.legend[i]) {
        legend = res.data.legend[i]
      }
      return {
        limit: res.data.limit && res.data.limit[i] ? res.data.limit[i] : '',
        type: types[i] ? types[i] : 'line',
        color: this.state.color[i],
        name: legend,
        unit: res.data.unit[i],
        solidLine: res.data.solidLine ? res.data.solidLine[i] : ''
      }
    })
    const seriesCollection = []
    const seriesYAxis = []
    const that = this
    const unit = []
    let yIndex
    let seriesJSON
    currentOptions.series.forEach(function(o, i) {
      let currentSeries = {...that.state.defaultSeries, ...o}
      let yAxisJSON = {
        type: 'value',
        name: currentSeries.unit === '%' || currentSeries.unit === '' ? '' : (currentSeries.unit),
        show: that.props.yAxisShow !== undefined ? false : (unit.indexOf(currentSeries.unit) === -1) ? true : false,//判断是否有重复单位
        position: (unit.length + 1) % 2 ? 'left' : 'right',
        offset: Math.ceil((unit.length) / 2) * 60,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ccc'
          }
        },
        splitLine: {
          show: currentOptions.ySplitLine,
          lineStyle: {
            color: currentOptions.axisLineColor
          }
        },
        axisLabel: {
          textStyle: {
            color: currentOptions.axisTextColor
          },
          formatter: currentSeries.unit === '%' ? '{value}%' : '{value}'//y轴模板
        }
      }
      let _color = currentSeries.color
      if (_color.includes('rgba')) {
        let first = _color.split(')')
        let second = first[0].split(',')
        // 透明度修改为1
        second[second.length - 1] = 1
        first[0] = second.join(',')
        _color = first.join(')')
      }

      unit.forEach((o, i) => {
        if (o === currentSeries.unit) {
          yIndex = i
        }
      })

      seriesJSON = {
        name: showName === false ? '' : currentSeries.name,
        type: currentSeries.type,
        barMaxWidth: that.props.barMaxWidth ? that.props.barMaxWidth : '10%',
        barGap: currentOptions.barGap ? currentOptions.barGap : undefined,
        showSymbol: false,
        smooth: currentOptions.smooth ? true : false,
        //symbolSize: that.props.continue?20:undefined,
        label: {
          normal: {
            show: false,
            position: 'top'
          }
        },
        lineStyle: {
          normal: {
            color: that.props.isCompare ? _color : currentSeries.color,
            width: currentSeries.type === 'line' ? currentSeries.width : null
          }
        },
        itemStyle: {
          normal: {
            // color: function(params) {
            //   if (that.props.isCompare) {
            //     const colorArr = [currentSeries.color, _color]
            //     const date = new Date()
            //     let year = date.getFullYear()
            //     let month = date.getMonth() + 1
            //     let day = date.getDate() - 1
            //     let monthStr = month + ''
            //     let dayStr = day + ''
            //     if (month < 12) {
            //       monthStr = '0' + month
            //     }
            //     if (day < 10) {
            //       dayStr = '0' + day
            //     }
            //     let currentDay = `${year}-${monthStr}-${dayStr}`
            //     let color = colorArr[0]
            //     // 默认当天高亮
            //     if (params.name === currentDay && !that.state.isCheckName) {
            //       color = colorArr[1]
            //     }
            //     // 选中的部分高亮
            //     if (params.name === that.state.isCheckName) {
            //       color = colorArr[1]
            //     }
            //     if (!types.includes('bar')) {
            //       color = colorArr[1]
            //     }
            //     console.log(color)
            //     return color
            //   }
            //   return currentSeries.color
            // }, //api更新移出
            lineStyle: {
              type: currentSeries.solidLine === '' ? 'solid' : currentSeries.solidLine ? 'solid' : 'dashed'
            }
          },
          emphasis: {
            color: _color
          }//api更新移出
        }, //api更新从上方移出
        emphasis: {
              color: _color
          },
        // color: function(params) {
        //       if (that.props.isCompare) {
        //           const colorArr = [currentSeries.color, _color]
        //           const date = new Date()
        //           let year = date.getFullYear()
        //           let month = date.getMonth() + 1
        //           let day = date.getDate() - 1
        //           let monthStr = month + ''
        //           let dayStr = day + ''
        //           if (month < 12) {
        //               monthStr = '0' + month
        //           }
        //           if (day < 10) {
        //               dayStr = '0' + day
        //           }
        //           let currentDay = `${year}-${monthStr}-${dayStr}`
        //           let color = colorArr[0]
        //           // 默认当天高亮
        //           if (params.name === currentDay && !that.state.isCheckName) {
        //               color = colorArr[1]
        //           }
        //           // 选中的部分高亮
        //           if (params.name === that.state.isCheckName) {
        //               color = colorArr[1]
        //           }
        //           if (!types.includes('bar')) {
        //               color = colorArr[1]
        //           }
        //           console.log(color)
        //           return color
        //       }
        //       return currentSeries.color
        //   },
        yAxisIndex: (unit.indexOf(currentSeries.unit) === -1) ? i : yIndex,
        step: typeof (that.props.step) === 'object' ? that.props.step[i] : '',
        data: yData[i],
        markArea: {
          data: []
        },
        markLine: {
          data:
            currentSeries.limit ? currentSeries.limit.map(v => {
              return {
                yAxis: v.val, lineStyle: {
                  normal: {
                    type: 'solid'
                  }
                },
                label: {
                  normal: {
                    show: false
                  }
                }
              }
            }) : ''

        }

      }
      if (that.props.barGap || that.props.barGap === 0) {
        seriesJSON.barGap = 0
      }
      seriesCollection.push(seriesJSON)
      seriesYAxis.push(yAxisJSON)
      if (!unit.includes(currentSeries.unit)) {
        unit.push(currentSeries.unit)
      }
    })
    const echartJSON = {
      series: null,
      yAxis: null,
      title: {
        text: currentOptions.title,
        textStyle: {
          fontWeight: 'normal',
          fontSize: 14,
          color: currentOptions.axisTextColor
        },
        top: -5,
        left: 29
      },
      tooltip: {
        borderWidth: 0,
        confine: 'true',
        trigger: 'axis',
        formatter: function(params) {
          if (params[0].name === '') {
            return null
          }
          // 如果碰到特殊情况，则不显示延长部分的值（首位部分）
          let flag = false
          // 如果存在延长部分则进行特殊处理
          if (params[normalIndex[0]]) {
            if (that.props.isCompare && params[extendIndex[0]].dataIndex === 0 && params[extendIndex[0]].seriesName === extendName[0] && params[normalIndex[0]].dataIndex !== 0) {
              flag = true
            }
            if (that.props.isCompare && params[extendIndex[0]].dataIndex === yData[extendIndex[0]].length - 1 && params[extendIndex[0]].seriesName === extendName[0] && params[normalIndex[0]].dataIndex !== 0) {
              flag = true
            }
          } else {
            if (that.props.isCompare && params[extendIndex[0]].dataIndex === 0 && params[extendIndex[0]].seriesName === extendName[0]) {
              return null
            }
            if (that.props.isCompare && params[extendIndex[0]].dataIndex === yData[extendIndex[0]].length - 1 && params[extendIndex[0]].seriesName === extendName[0]) {
              return null
            }
          }
          let _datat = currentOptions.series
          let resDom = '<div>' + params[0].name + '</div>'
          for (let i = 0; i < params.length; i++) {
            if (flag && extendIndex.includes(i)) {
              continue
            }
            let unit = ''
            if (_datat && _datat[i] && _datat[i].unit) {
              unit = _datat[i].unit
            }
            if (that.props.onlyOne) {
              if (params[i].data[1] === '') {
                resDom = ''
              } else {
                resDom = '<div>' + params[0].name + '</div>'
                resDom += '<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + ' : ' + (Array.isArray(params[i].data) ? params[i].data[1] : params[i].data) + unit + '</div>'
              }
              let val = res.data.results[0].filter(v => {
                return v.dtime === params[0].axisValue
              })
              if (val[0]) {
                if (resDom === '') {
                  resDom = '<div>' + params[0].name + '</div>'
                  resDom += '<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + ' : ' + (Array.isArray(params[i].data) ? params[i].data[1] : params[i].data) + unit + '</div>'
                }
                resDom += '<div>' + val[0].dtimeCompare + '</div>'
                resDom += '<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + ' : ' + val[0].valCompare + unit + '</div>'
              } else {
              }
            } else {
              resDom += '<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[i].color + '"></span>' + params[i].seriesName + ' : ' + (Array.isArray(params[i].data) ? params[i].data[1] : params[i].data) + unit + '</div>'
            }
          }
          return resDom
        }
      },
      grid: {
        bottom: this.props.bottom || 40,
        top: 50,
        left: this.props.ylength === 'long' ? 120 : (this.props.left ? this.props.left : 60) + (Math.ceil((unit.length) / 2) - 1) * 60,
        right: (this.props.right ? this.props.right : 60) + Math.ceil(unit.length / 2 - 1) * 60
      },
      dataZoom: [
        {
          type: 'inside',
          yAxisIndex: this.props.overTurn ? 0 : null,
          start: this.props.startView ? this.props.startView : undefined,
          end: this.props.endView ? this.props.endView : undefined,
          zoomOnMouseWheel: this.props.zoomOnMouseWheel ? this.props.zoomOnMouseWheel : true
        }
      ],
      xAxis: [{
        name: this.props.xName ? this.props.xName : '',
        type: 'category',
        boundaryGap: types.includes('bar') && !types.includes('line'),
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          textStyle: {
            color: currentOptions.axisTextColor
          },
          formatter: '{value} '//x轴模板
        },
        data: currentOptions.xData
      }],
      legend: {
        show: this.props.show === false ? false : true,
        // icon: 'rect',
        itemWidth: 20,
        itemHeight: 8,
        itemGap: 13,
        data: currentOptions.series.map((o) => o.name),
        textStyle: {
          fontSize: 12,
          color: currentOptions.axisTextColor
        },
        top: 'top',
        right: 20
        // padding: [0, 0, 0, 0]
      }
    }
    if (this.props.overTurn) {
      for (let key in echartJSON) {
        if (key === 'xAxis') {
          echartJSON['yAxis'] = echartJSON[key]
          delete echartJSON[key]
        }
      }
      echartJSON.xAxis = seriesYAxis
    } else {
      echartJSON.yAxis = seriesYAxis
    }
    if (res.data.chargeTime) {
      notMerge = true
      res.data.chargeTime.forEach((v, i) => {
        let start = currentOptions.xData.indexOf(v.startTime)
        let end
        if (v.endTime === '00:00:00') {
          end = currentOptions.xData.length - 1
        } else {
          end = currentOptions.xData.indexOf(v.endTime)
        }
        seriesJSON.markArea.data.push([{
          name: '充电时段',
          xAxis: start,
          label: {normal: {color: this.props.theme === 'space-gray' ? 'white' : 'black'}},
          itemStyle: {normal: {color: '#e3f8ff', opacity: '0.6'}}
        }, {xAxis: end}])
      })
      res.data.dischargeTime.forEach((v, i) => {
        let start = currentOptions.xData.indexOf(v.startTime)
        let end
        if (v.endTime === '00:00:00') {
          end = currentOptions.xData.length - 1
        } else {
          end = currentOptions.xData.indexOf(v.endTime)
        }
        seriesJSON.markArea.data.push([{
          name: '放电时段',
          xAxis: start,
          label: {normal: {color: this.props.theme === 'space-gray' ? 'white' : 'black'}},
          itemStyle: {normal: {color: '#d9f0d9', opacity: '0.6'}}
        }, {xAxis: end}])
      })
      res.data.normalTime.forEach((v, i) => {
        let start = currentOptions.xData.indexOf(v.startTime)
        let end
        if (v.endTime === '00:00:00') {
          end = currentOptions.xData.length - 1
        } else {
          end = currentOptions.xData.indexOf(v.endTime)
        }
        seriesJSON.markArea.data.push([{
          name: '蓄电时段',
          xAxis: start,
          label: {normal: {color: this.props.theme === 'space-gray' ? 'white' : 'black'}},
          itemStyle: {normal: {color: '#fff7d9', opacity: '0.6'}}
        }, {xAxis: end}])
      })
    }
    echartJSON.series = seriesCollection
    if (this.props.isCompare && echartJSON.series[extendIndex[0]] && echartJSON.series[extendIndex[0]].data.length) {
      // 存在指标数据则根据指标数据进行新增首尾
      for (let i = 0, len = extendIndex.length; i < len; ++i) {
        echartJSON.series[extendIndex[i]].data.unshift([echartJSON.series[extendIndex[i]].data[0][0] - 1, echartJSON.series[extendIndex[i]].data[0][1]])
        echartJSON.series[extendIndex[i]].data.push([echartJSON.series[extendIndex[i]].data[echartJSON.series[extendIndex[i]].data.length - 1][0] + 1, echartJSON.series[extendIndex[i]].data[echartJSON.series[extendIndex[i]].data.length - 1][1]])
      }
      echartJSON.series.forEach(v => {
        v.data.forEach(subV => {
          subV[0] = ++subV[0]
          if (subV[0] < 0) {
            subV[0] = 0
          }
        })
      })
      // xDate数据第一次点击时出现多次添加的情况，暂时未找到原因，先特殊处理
      if (echartJSON.xAxis[0].data[0] !== '') {
        echartJSON.xAxis[0].data.unshift('')
        echartJSON.xAxis[0].data.push('')
      }
    } else if (this.props.isCompare) {
      // 如果不存在指标数据，则取实际数据中较长的数据长度循环增加首尾
      // const chargeLen = echartJSON.series[normalIndex[0]].data.length
      // const disChargeLen = echartJSON.series[normalIndex[0]].data.length
      // const len = chargeLen > disChargeLen ? chargeLen : disChargeLen
      // for (let i = 0; i < len; ++i) {
      //   for (let j = 0, len = extendIndex.length; j < len; ++j) {
      //     echartJSON.series[extendIndex[j]].data[echartJSON.series[extendIndex[j]].data] = ''
      //   }
      // }
      echartJSON.series.forEach(v => {
        v.data.forEach(subV => {
          subV[0] = ++subV[0]
          if (subV[0] < 0) {
            subV[0] = 0
          }
        })
      })
      // xDate数据第一次点击时出现多次添加的情况，暂时未找到原因，先特殊处理
      if (echartJSON.xAxis[0].data[0] !== '') {
        echartJSON.xAxis[0].data.unshift('')
        echartJSON.xAxis[0].data.push('')
      }
    }
    this.setState({
      selfReload: false
    })
    if(this.props.yAxisCustomProps) {
      if(Array.isArray(echartJSON['yAxis'])) {
        echartJSON['yAxis'] = echartJSON['yAxis'].map(item => {
          return { ...item, ...this.props.yAxisCustomProps }
        });
      } else {
        echartJSON['yAxis'] = { ...echartJSON['yAxis'], ...this.props.yAxisCustomProps }
      }
    }
    if (state.chartObj.getOption()) {
      //解决本次绘图受上次影响的问题
      if (!this.props.unclear) {
        state.chartObj.clear()
      }
      state.chartObj.setOption(echartJSON, notMerge)
    } else {
      state.chartObj.setOption(echartJSON, notMerge)
      //解决初次进来echart图太小的问题
      setTimeout(() => {
        state.chartObj.resize()
      })
    }
  }

  //刷新图表
  setChartData = (flag?) => {
    let props = this.props
    if (this.state.selfReload) {
      this.setEcharts(this.state.lastData,true)
    } else if (props.url) {
      if (props.method === 'post' && props.postData) {
          Services.postChartAxios({url:props.url, postData:props.postData})
          .then(res => {
            this.setState({
              lastData: res
            })
            this.setEcharts(res)
          })
      } else if (props.postData) {
          Services.getChartAxios({url:props.url, postData:props.postData})
          .then(res => {
            this.setState({
              lastData: res
            })
            this.setEcharts(res,true)
          })
      } else {
          Services.chartAxios(props.url)
          .then(res => {
            this.setState({
              lastData: res
            })
            this.setEcharts(res)
          })
      }
    } else {
      this.setEcharts(props.echartsData, true)
    }
  }
  //切换主题
  changeTheme = (theme) => {
    let echartTheme = gdata('echartThemes')[theme]
    echartTheme.theme = theme
    this.setState({...echartTheme}, () => {
      this.setChartData('changeTheme')
    })
  }
  listen = () => {
    this.chartbox.current.style.zoom = window.zoomGrow
  }

  componentDidMount() {
    //配置主题
    const theme = localStorage.getItem('user-theme')
    if (this.props.lockTheme) {
      this.changeTheme(this.props.lockTheme)
    }
    this.listen()
    window.addEventListener('resize', this.listen)

    const props = this.props
    const chartObj = echarts.init(document.getElementById(props.id) as HTMLDivElement)

    this.setState({chartObj})
    this.activeResize(chartObj)
    //设置轮询请求
    if (this.props.interval) {
      if (this.props.interval > 0) {
        loopReqChart('timer' + this.props.id, this.props.interval, this.setChartData)
      }
    } else {
      loopReqChart('timer' + this.props.id, Config.chartTimer, this.setChartData)
    }
    chartObj.on('mouseover', props.setTime)
    if (this.props.isChangeTime) {
      chartObj.on('click', (params) => {
        this.setState({
          isCheckName: params.name,
          selfReload: true
        }, this.setChartData)
        let _date = params.name
        if (params.name === '') {
          _date = null
        }
        this.props.isChangeTime(_date)
      })
    }
    if (this.props.openModal) {
      chartObj.on('click', (params) => {
        this.props.openModal(params, this.props.id)
      })
    }
    window['overLoad'] = window.setInterval(() => {
      this.setState({
        loader: false
      })
    }, 10000)
  }

  componentDidUpdate() {
    const chartObj = this.state.chartObj
    if (this.props.legendChange && this.props.legendChange !== this.state.legendSign) {
      this.setState({
        legendSign: this.props.legendChange
      }, () => {
        chartObj.dispatchAction({
          type: 'legendToggleSelect',
          // 图例名称
          name: this.props.legendChange.name
        })
      })
    }
    const props = this.props
    const state = this.state
    // 判断所传参数已经请求urk是否改变,确定是否立即重新请求
    const nowRender = (JSON.stringify(props.postData) !== JSON.stringify(state.postData)) || props.url !== state.url
    // 判断传入值是否合法
    const ifLawful = props.postData ? Object.keys(props.postData).length > 0 : true
    // 参数改变并且传入值合法则立即请求并刷新
    if (nowRender && ifLawful && props.url) {
      this.setState({
        postData: props.postData,
        url: props.url
      }, () => {
        this.setChartData('nowRender')
      })
    }
    if (JSON.stringify(props.echartsData) !== (JSON.stringify(this.state.echartsData) && props.echartsData)) {
      this.setChartData('props.echartsData change')

    }
    // 主题发生改变
    if (props.theme !== state.theme && props.theme && !props.lockTheme) {
      const theme = props.theme
      this.changeTheme(theme)
    }
    // 主题发生改变
    if (props.types !== state.types && props.types) {
      // console.log('setChartData1',props.types , state.types)

      // this.setChartData();
    }
}

  componentWillUnmount() {
    window.onresizeArr = []
    delLoopReq('timer' + this.props.id)
    window.clearInterval(window['overLoad'])
    //重写setState方法防止组件被销毁后还在执行setState方法从而导致后台报错
    this.setState = (state, callback) => {
      return
    }
    window.removeEventListener('resize', this.listen)
  }

  render() {
    const {width, height, minHeight} = this.props
    const loaderDom = this.state.loader ? <Loader/> : null
    return (
      <div className="y_chart" style={{width, height, minHeight}}>
        {loaderDom}
        <div id={this.props.id || 'id'} style={{width: '100%', height: '100%', minHeight: minHeight}} ref={this.chartbox}>
        </div>
      </div>
    )
  }
}

export default Echart
