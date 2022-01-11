import React, { Component } from 'react';
import './SvgChart.less';
import waterBreaker from './waterBreaker'
import svgUpdateMethod from './svgUpdate'
import waringMethod from './waring'
import svgArrowMethod from './svgArrow'
import utils from '../../public/js/utils';

let d3 = require('d3');
let analogXMLMap = {}; //点号数组xml对象
let analogTempMap = {};  //点号数组
let discreteaMap = {};  //点号数组
let discretebMap = {};  //点号数组
let discretecMap = {};  //点号数组
let discretedMap = {};  //点号数组
let arrowStatus = {};  //key:数据id  value:1表示正方向 -1表示反方向
// let water_gauge;
// let gaugeObject = [];
let bucketIds = {};//水桶id数组
let arrowIds = {};//电流id对象
let kvdata = {};
let svgGlobalConfig = {};

class SvgChart extends Component {
  constructor(props) {
    super(props);
    this.path = ''
  };

  componentDidMount() {
    const { path } = this.props;
    if (path) {
      this.create(path);
      //记忆当前路径
      this.path = path;
    }
  }

  componentWillUnmount() {
    window.clearInterval(window.spinInterval);
  }

  componentDidUpdate() {
    if (this.props.svgData && Object.keys(this.props.svgData).length > 0) {
      this.update(this.props.svgData, this.props.dispatch);
    }
    if (this.props.path && this.props.path !== this.path) {
      bucketIds = {}
      arrowIds = {}
      kvdata = {};
      svgGlobalConfig = {}
      this.create(this.props.path);
      this.path = this.props.path;
    }
  }

  //更新组件
  update(svgData, dispatch) {
    waringMethod.clearTwinkle();//清除上次点号定时器闪烁
    svgUpdateMethod.analogValueChange(svgData.analogValueArr, analogXMLMap, discretebMap, discreteaMap, analogTempMap)
    svgUpdateMethod.disconnectorsValueChange(svgData.disconnectorsValueArr)
    svgUpdateMethod.estimateValueChange(svgData.estimateValueArr)
    //kvdata点号集 用来判断水桶和电流的变化
    
    if (svgData.analogValueArr) {
      let analogValueMap = svgData.analogValueArr;
      for (let k of analogValueMap) {
        let key = k.name;
        let value = k.value;
        kvdata[key] = value;
      }
    }
    //判断水桶(已更改为根据类型判断)
    if (d3.selectAll("g[styleType='water']")) {
      let gaugedata = {};
      for (let k of waterBreaker.gaugeObject) {
        let key = k.id;
        let value = k.gauge;
        gaugedata[key] = value;
      }
      d3.selectAll("g[styleType='water']").each(function (d, j) {
        d3.selectAll("path[type='water']").each(function (d, j) {
          if (kvdata[bucketIds[this.id]] !== undefined && gaugedata[this.id]) {
            gaugedata[this.id]?.update(transformValueByEnum(kvdata[bucketIds[this.id]], svgGlobalConfig['waterValueMap']))
          }
        });
      });
    }
    //判断电流方向(已更改为根据类型判断)
    if (d3.selectAll("path[type='arrow']")) {
      let that = this;
      let index = 0;
      d3.selectAll("path[type='arrow']").each(function (d, j) {
        let pointNumber =  this.attributes.pointNumber.value;
        let id =  this.attributes.id.value;
        const pointValue = transformValueByEnum(kvdata[pointNumber], svgGlobalConfig['arrowValueMap'])
        if (pointValue * arrowStatus["arrow_" + id] > 0) {
          d3.select("#arrow_" + id).attr("display", "block");
        } else if (pointValue * arrowStatus["arrow_" + id] < 0) {  //判断方向要反转
          d3.select("#arrow_" + id).attr("display", "block");
          that.revertPath(id);
          arrowStatus["arrow_" + id] = -1 * arrowStatus["arrow_" + id]; //更新方向
        } else if (pointValue * arrowStatus["arrow_" + id] === 0) {  //功率为0 无电流
          d3.select("#arrow_" + id).attr("display", "none");
        }
        index++;
      });
    }
    //判断电流方向(已更改为根据类型判断)
    if (d3.selectAll("path[type='blueArrow']")) {
      let that = this;
      let index = 0;
      d3.selectAll("path[type='blueArrow']").each(function (d, j) {
        let pointNumber =  this.attributes.pointNumber.value;
        let id =  this.attributes.id.value;
        if (kvdata[pointNumber] * arrowStatus["arrow_" + id] > 0) {
          d3.select("#arrow_" + id).attr("display", "block");
        } else if (kvdata[pointNumber] * arrowStatus["arrow_" + id] < 0) {  //判断方向要反转
          d3.select("#arrow_" + id).attr("display", "block");
          that.revertPath(id);
          arrowStatus["arrow_" + id] = -1 * arrowStatus["arrow_" + id]; //更新方向
        } else if (kvdata[pointNumber] * arrowStatus["arrow_" + id] === 0) {  //功率为0 无电流
          d3.select("#arrow_" + id).attr("display", "none");
        }
        index++;
      });
    }
    //设备颜色变化
    if (d3.selectAll("g[styleType='deviceColor']")) {
      d3.selectAll("g[styleType='deviceColor']").each(function (d, j) {
        let enumType = this.attributes?.enumType?.value;
        let color = JSON.parse(enumType)?.[(parseInt(kvdata[this.attributes?.pointNumber?.value]) + '')];
        if(!color) color = '#808080';
        if(this.attributes?.style?.nodeValue){
          this.attributes.style.nodeValue = `fill:${color};stroke:${color}`;
        }
      });
    }
    //文字颜色变化
    if (d3.selectAll("g[styleType='textColor']")) {
      d3.selectAll("g[styleType='textColor']").each(function (d, j) {
        let enumType = this.attributes?.enumType?.value;
        let color = JSON.parse(enumType)?.[(parseInt(kvdata[this.attributes?.pointNumber?.value]) + '')];
        if(!color) color = '#808080';
        if( this.attributes?.style?.nodeValue ){
          this.attributes.style.nodeValue = `fill:${color};`;
        }
      });
    }
     //判断状态
     if (d3.selectAll("g[textType='status']")) {
      d3.selectAll("g[textType='status']").each(function (d, j) {
        let enumType = this.attributes?.textEnumType?.value;
        let text = JSON.parse(enumType)?.[(parseInt(kvdata[this.attributes?.pointNumber?.value]) + '')];
        if(!text) text = '--';
        if(this.lastElementChild?.lastElementChild?.innerHTML){
          this.lastElementChild.lastElementChild.innerHTML = text;
        }
      });
    }
    //判断小数点
    if (d3.selectAll("g[decimal]")) {
      d3.selectAll("g[decimal]").each(function (d, j) {
        let decimalValue = Math.pow(10, parseFloat(this.attributes?.decimal?.value));
        let value = parseFloat(this.lastElementChild?.lastElementChild?.innerHTML);
        if(this.lastElementChild?.lastElementChild?.innerHTML !== '--'){
          this.lastElementChild.lastElementChild.innerHTML = Math.round(value * decimalValue) / decimalValue;
        }
      });
    }
    // //判断状态
    // if (d3.selectAll("g[styleType='status']")) {
    //   let that = this;
    //   d3.selectAll("g[styleType='status']").each(function (d, j) {
    //     console.log(kvdata,this.attributes.pointNumber.value)
    //     switch (kvdata[this.attributes.pointNumber.value] + '') {
    //       case '0':
    //         this.lastElementChild.lastElementChild.innerHTML = '禁止';
    //         break;
    //       case '1':
    //         this.lastElementChild.lastElementChild.innerHTML = '停机';
    //         break;
    //       case '2':
    //         this.lastElementChild.lastElementChild.innerHTML = '运行';
    //         break;
    //       case '9':
    //         this.lastElementChild.lastElementChild.innerHTML = '未知';
    //         break;
    //       default:
    //         this.lastElementChild.lastElementChild.innerHTML = '';
    //         break;
    //     }
    //   });
    // }
    //是否状态
    if (d3.selectAll("g[styleType='whether']")) {
      let that = this;
      d3.selectAll("g[styleType='whether']").each(function (d, j) {
        switch (kvdata[this.attributes.pointNumber.value] + '') {
          case '0':
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('否1');
            break;
          case '1':
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('是1');
            break;
          default:
            this.lastElementChild.lastElementChild.innerHTML = '';
            break;
        }
      });
    }
    //闭合断开状态
    if (d3.selectAll("g[styleType='switch']")) {
      let that = this;
      d3.selectAll("g[styleType='switch']").each(function (d, j) {
        switch (kvdata[this.attributes.pointNumber.value] + '') {
          case '0':
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('断开');
            break;
          case '1':
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('闭合');
            break;
          default:
            this.lastElementChild.lastElementChild.innerHTML = '';
            break;
        }
      });
    }
    //运行状态状态
    if (d3.selectAll("g[styleType='fault']")) {
      let that = this;
      d3.selectAll("g[styleType='fault']").each(function (d, j) {
        switch (kvdata[this.attributes.pointNumber.value] + '' === 'undefined' ? '' : kvdata[this.attributes.pointNumber.value] + '' === '0') {
          case true:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('无故障');
            break;
          case false:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('有故障');
            break;
          default:
            this.lastElementChild.lastElementChild.innerHTML = '';
            break;
        }
      });
    }
    //运行状态状态
    if (d3.selectAll("g[styleType='breakdown']")) {
      let that = this;
      d3.selectAll("g[styleType='breakdown']").each(function (d, j) {
        switch (kvdata[this.attributes.pointNumber.value] + '' === 'undefined' ? '' : kvdata[this.attributes.pointNumber.value] + '' === '0') {
          case true:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('有故障');
            break;
          case false:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('无故障');
            break;
          default:
            this.lastElementChild.lastElementChild.innerHTML = '';
            break;
        }
      });
    }
    //闭合断开状态
    if (d3.selectAll("g[styleType='warning']")) {
      let that = this;
      d3.selectAll("g[styleType='warning']").each(function (d, j) {
        switch (kvdata[this.attributes.pointNumber.value] + '' === '1') {
          case true:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('无告警');
            break;
          case false:
            this.lastElementChild.lastElementChild.innerHTML = utils.intl('有告警');
            break;
          default:
            this.lastElementChild.lastElementChild.innerHTML = '';
            break;
        }
      });
    }
    //初始化旋转元件
    if (d3.selectAll("g[type='spin']")) {
      d3.selectAll("g[type='spin']").each(function (d, j) {
        if(kvdata[this.attributes?.pointNumber?.value]?.toFixed(0) + '' === '2'){
        const BBox = this.getBBox();
        const pivotX = BBox.x + BBox.width * 0.5; //旋转中心X轴坐标
        const pivotY = BBox.y + BBox.height * 0.5;//旋转中心轴坐标
        //旋转
        this.setAttribute?.("class", "svg-rotate")
        let style = this.getAttribute("style") || ''
        style = style.replace(/transform-origin: \d+(\.\d+)?px \d+(\.\d+)?px;/g, '')
        this.setAttribute("style", `${style};transform-origin: ${pivotX}px ${pivotY}px;`)
        }else{
        this.setAttribute?.("class", "svg-no-rotate")
        let style = this.getAttribute("style") || ''
        style = style.replace(/transform-origin: \d+(\.\d+)?px \d+(\.\d+)?px;/g, '')
        this.setAttribute("style", `${style}`)
        }
      });
    }
    //阿里判断数据异常
    let pileArray = [];
    let groupArray = [];
    let thats = this;
    d3.select("#analogs").selectAll("g").each(function (index) {
      const that = this;
      //ups显示时间
      if (this.attributes["type"]?.value === 'time') {
        let timeCode = this.children[2].children[0].innerHTML;
        if (timeCode.includes(':')) {
          timeCode = timeCode.split(':')[1];
          let str_time = timeCode * 1000;
          let date = new Date(str_time),
            year = date.getFullYear(),//年
            month = date.getMonth() + 1,//月
            day = date.getDate(),//日
            hour = date.getHours(),//时
            min = date.getMinutes(),//分
            sen = date.getSeconds(),//秒
            time = year + '-' + getzf(month) + '-' + getzf(day) + ' ' + getzf(hour) + ':' + getzf(min) + ':' + getzf(sen);
          this.children[2].children[0].innerHTML = time;
          return time;
        } else {
          let str_time = timeCode * 1000;
          let date = new Date(str_time),
            year = date.getFullYear(),//年
            month = date.getMonth() + 1,//月
            day = date.getDate(),//日
            hour = date.getHours(),//时
            min = date.getMinutes(),//分
            sen = date.getSeconds(),//秒
            time = year + '-' + getzf(month) + '-' + getzf(day) + ' ' + getzf(hour) + ':' + getzf(min) + ':' + getzf(sen);
          this.children[2].children[0].innerHTML = time;
          return time;
        }
      }

      function getzf(num) {
        if (parseInt(num) < 10) {
          num = '0' + num;
        }
        return num;
      }
      //告警信息展示
      if (this.attributes["displayType"]) {//判断警告信息
        // console.log(this.attributes,this)
        //this.style.display = 'block';
        if (this.attributes["displayType"].value === "analoga") {
          let dataAlarm = this.children[2].children[0];
          const that = this;
          if (dataAlarm.innerHTML === '初始化') {
            d3.selectAll("[scadaType='rectifierInverters']")
              .each(function (d, j) {
                if (that.attributes['devID'].value === this.attributes['cimID'].value) {
                  // console.log(this.children,this.children[4].style.stroke)
                  this.children[4].style.fill = "#624e41";
                  this.children[5].style.stroke = "#58413c";
                }
              })
          }
          if (dataAlarm.innerHTML !== '初始化') {
            d3.selectAll("[scadaType='rectifierInverters']")
              .each(function (d, j) {
                if (that.attributes['devID'].value === this.attributes['cimID'].value) {
                  // console.log(this.children,this.children[4].style.stroke)
                  this.children[4].style.fill = "rgb(28, 203, 42)";
                  this.children[5].style.stroke = "rgb(28, 203, 42)";
                }
              })
          }
        }
        else if (this.attributes["displayType"].value === "dircreteb") {
          let dataAlarm = this.children[2].children[1];
          if (this.attributes["title"].value !== 'ups状态' && dataAlarm.innerHTML !== '0' && dataAlarm.innerHTML !== '0.12' && dataAlarm.innerHTML !== '正常' && dataAlarm.innerHTML !== '关闭') {
            if (dataAlarm.innerHTML !== '') {
              thats.showAlarm(dataAlarm);
              dataAlarm.innerHTML = "断开";
            } else {
              dataAlarm.innerHTML = "";
              waringMethod.resColor(dataAlarm);
            }
            waringMethod.setColor(dataAlarm, index);
          }
          else {
            dataAlarm.innerHTML = "闭合";
            waringMethod.resColor(dataAlarm);
          }
        }
        else if (this.attributes["displayType"].value === "alarma") {
          let dataAlarm = this.children[1].children[1];
          if (this.attributes["title"].value !== 'ups状态' && dataAlarm.innerHTML !== '0' && dataAlarm.innerHTML !== '0.12' && dataAlarm.innerHTML !== '正常' && dataAlarm.innerHTML !== '关闭' && dataAlarm.innerHTML === '故障') {
            waringMethod.setColor(dataAlarm, index);
          }
          else {
            waringMethod.resColor(dataAlarm);
          }
        }
        else {
          if (this.children.length > 2) {
            let dataAlarm = this.children[2].children[0];
            if (this.attributes["title"].value === 'ups状态') {//乌斯太目前没有
              if (dataAlarm.innerHTML === '1.0') {
                waringMethod.resColor(dataAlarm);
                dataAlarm.innerHTML = ('储能模式')
              } else {
                waringMethod.setColor(dataAlarm, index);
                thats.showAlarm(dataAlarm);
                dataAlarm.innerHTML = ('非储能模式')
              }
            }
            if (this.attributes["title"].value !== 'ups状态' && dataAlarm.innerHTML !== '0' && dataAlarm.innerHTML !== '0.12'
              && dataAlarm.innerHTML !== ('正常') && dataAlarm.innerHTML !== ('关闭') && dataAlarm.innerHTML !== '') {
              if (dataAlarm.innerHTML !== ('打开') && dataAlarm.innerHTML !== ('故障')) { //乌斯太目前没有，之后可能会有
                thats.showAlarm(dataAlarm);
                dataAlarm.innerHTML = ("告警");
              }
              waringMethod.setColor(dataAlarm, index);
              d3.select("#dev").selectAll("g").each(function (item, index) {
                if (this.attributes['cimID']) {
                  let pile = this.children[0];//电池堆
                  let group = this.children[1];//电池组
                  if (this.attributes['cimID'].value === that.attributes["devID"].value) {
                    if (this.attributes['id'].value.split('_')[0] === 'storages' && !pileArray.includes(index)) {
                      waringMethod.setBoxColor(pile, index);
                      pileArray.push(index);
                    } else if (this.attributes['id'].value.split('_')[0] === 'packs' && !groupArray.includes(index)) {
                      waringMethod.setBoxColor(group, index);
                      groupArray.push(index);
                    }
                  }
                }
              })
            }
            //返回常态
            else if (dataAlarm.innerHTML !== ('关闭') && this.attributes["title"].value !== 'ups状态') {
              if (dataAlarm.innerHTML === '') {
                dataAlarm.innerHTML = "";
              } else {
                dataAlarm.innerHTML = ("正常");
              }
              d3.select("#dev").selectAll("g").each(function (item, index) {
                if (this.attributes['cimID']) {
                  let pile = this.children[0];//电池堆
                  let group = this.children[1];//电池组
                  if (this.attributes['cimID'].value === that.attributes["devID"].value) {
                    if (this.attributes['id'].value.split('_')[0] === 'storageBoxes' && !pileArray.includes(index)) {
                      waringMethod.resBoxColor(pile);
                    } else if (this.attributes['id'].value.split('_')[0] === 'packs' && !groupArray.includes(index)) {
                      waringMethod.resBoxColor(group);
                    }
                  }
                }
              })
              waringMethod.resColor(dataAlarm);
              dataAlarm.parentElement.parentElement.setAttribute('onmouseover', '');
              dataAlarm.parentElement.parentElement.setAttribute('onmouseout', '');
            } else if (dataAlarm.innerHTML === ('关闭')) {
              waringMethod.resColor(dataAlarm);
            }
          }
        }
        //添加点击显示历史曲线事件
        let data = this.attributes["pointNumber"]?.value;
        // this.setAttribute('onclick', 'getCode("' + data + '")');
        this.setAttribute('onmouseover', 'showPointer()');
        this.setAttribute('onmouseout', 'hidePointer()');
      } else {
        //添加点击显示历史曲线事件
        let data = this.attributes["pointNumber"]?.value;
        // this.setAttribute('onclick', 'getCode("' + data + '")');
        this.setAttribute('onmouseover', 'showPointer()');
        this.setAttribute('onmouseout', 'hidePointer()');
      }
    });
    d3.select("#Analog").selectAll("text").each(function (index) {
      let data = this.previousElementSibling.children[9].textContent;
      // this.setAttribute('onclick', 'getCode("' + data + '")');
      this.setAttribute('onmouseover', 'showPointer()');
      this.setAttribute('onmouseout', 'hidePointer()');
    });
    d3.select("#analogs").selectAll("g").each(function (index) {
      let that = this;
      if ((this.attributes["pointNumber"]?.value === '10001000310014435' || this.attributes["pointNumber"]?.value === '100090000001') && d3.select("#tspan7516")._groups[0][0] !== null) {
        if (this.children[2].children[0].innerHTML === ("通信中断")) {
          d3.select("#tspan7516")._groups[0][0].innerHTML = ("通信中断");
        }
        else if (that.attributes["pointNumber"]?.value === '10001000310014435' && d3.select("#tspan7516")._groups[0][0] !== null) {
          if (that.children[2].children[0].innerHTML > 0) {
            d3.select("#tspan7516")._groups[0][0].innerHTML = ("放电中");
          }
          if (that.children[2].children[0].innerHTML === '0') {
            d3.select("#tspan7516")._groups[0][0].innerHTML = ("蓄电中");
          }
          if (that.children[2].children[0].innerHTML < 0) {
            d3.select("#tspan7516")._groups[0][0].innerHTML = ("充电中");
          }
        }
      }

    })
  }
  //显示告警数据方法
  showAlarm(dataAlarm) {
    const { dispatch } = this.props;
    let dotMark = parseInt(dataAlarm.innerHTML);
    let pointNumber = dataAlarm.parentElement.parentElement.attributes['pointNumber']?.value;
    let _analogMap = {};
    _analogMap[pointNumber] = dotMark;
    // dispatch({
    //   type: 'connect-line/analogMap', payload: {
    //     _analogMap
    //   }
    // }).then(res => {
    //   if (res) {
    //     let alarmData = res[pointNumber];
    //     if (alarmData !== '无效值,未找到对应报警状态') {
    //       dataAlarm.parentElement.parentElement.setAttribute('onmouseover', 'dataSvgElementDialog("' + alarmData + '")');
    //       dataAlarm.parentElement.parentElement.setAttribute('onmouseout', 'hideSvgElementDialog()');
    //     }
    //   }
    // })
  }
  //反转path方向
  revertPath(pathId) {
    let d = d3.select("#" + pathId).attr("d");
    if (d[0] === 'M') {
      this.revertPathAbsolute(pathId)
    } else {
      this.revertPathRelative(pathId)
    }
  }

  //反转path方向 M
  revertPathAbsolute(pathId) {
    let d = d3.select("#" + pathId).attr("d");
    let newD = '';
    let arrt = ' ';
    let da = d.split(arrt);
    let m = da[0];

    for (let i = (da.length - 1); i > 0; i--) {
      newD = newD + arrt + da[i];
    }
    newD = m + newD;

    d3.select("#" + pathId).attr("d", newD);
  }

  //反转path方向 m
  revertPathRelative(pathId) {
    let d = d3.select("#" + pathId).attr("d");
    let newD;
    let arrt = ' ';
    let da = d.split(arrt);
    let coordinate = {};
    let newBack = '';
    let endPointX = 0;
    let endPointY = 0;
    for (let i = 1; i <= (da.length - 1); i++) {
      coordinate["cx" + i] = da[i].split(',')[0];
      coordinate["cy" + i] = da[i].split(',')[1];
      endPointX = endPointX + parseFloat(coordinate["cx" + i]);
      endPointY = endPointY + parseFloat(coordinate["cy" + i]);
    }
    for (let i = (da.length - 2); i >= 1; i--) {
      newBack = newBack + arrt + (-1.0 * parseFloat(da[i + 1].split(',')[0])) + ',' + (-1.0 * parseFloat(da[i + 1].split(',')[1]));
    }
    let m = da[0];
    newD = m + arrt + endPointX + ',' + endPointY + newBack;
    d3.select("#" + pathId).attr("d", newD);
  }

  create(path) {
    let analogArr = [];  //点号数组
    let breakerArr = []; //breaker开关id数组
    let switchArr = [];  //switch开关id数组
    let disconnectorsArr = [];  //disconnectors开关id数组
    let estimateArr = [];
    let timeStampArr = [];
    let pcsStatusArr = [];  //pcsid数组
    let valueGather = {}; //数值集合对象
    const { scaleId, callBack } = this.props;
    const el = document.getElementById('svg');

    function isNumber(String) {
      if (String == null || String === '') return false;
      if (String.startsWith("#"))
        String = String.replace("#", "");
      let Letters = "1234567890";//可以自己增加可输入值
      let i;
      let c;
      for (i = 0; i < String.length; i++) {
        c = String.charAt(i);
        if (Letters.indexOf(c) < 0)
          return false;
      }
      return true;
    }

    let zoom = d3.zoom().scaleExtent([0.5, 20]).on("zoom", zoomed);

    function zoomed() {
      d3.select(scaleId).attr("transform", d3.event.transform);
    }

    function _getCircleProps(id) {
      let target = d3.select('#' + id)._groups[0][0];
      let width = target.getBBox().width;
      let height = target.getBBox().height;
      let props = {
        idDom: id,
        width: width,
        height: height,
        textColor: "#000",
        waveTextColor: "#000",
        textSize: 1.5,
        outerCircle: {
          r: 20,
          fillColor: '#35a1e8'
        },
        innerCircle: {
          r: 20,
          fillColor: 'rgba(116, 105, 95,0.8)'
        }
      };
      return props;
    }

    function getConfig() {
      const config = {}
      if (d3.selectAll("path[type='config']")) {
        d3.selectAll("path[type='config']").each(function (d, j) {
          for (let attr of this.attributes) {
            config[attr.name] = formatConfigValue(attr.name, attr.value)
          }
        });
      }
      return config
    }

    d3.xml(path).then((documentFragment) => {
      let svgNode = documentFragment.getElementsByTagName("svg")[0];
      if (!svgNode) {
        svgNode = documentFragment.getElementsByTagName("svg:svg")[0];
      }
      let main_chart_svg = d3.select(el);
      main_chart_svg.select("svg").remove();
      main_chart_svg.node().appendChild(svgNode);
      let innerSVG = main_chart_svg.select("svg");
      innerSVG.attr("width", "100%").attr("height", "100%").attr("preserveAspectRatio", "xMidYMid meet");
      innerSVG.selectAll("g")
        .each(function (d, i) {
          let id = this.id;
          if (isNumber(id)) {
            d3.select(this).attr("id", "a" + id);
          }
        });
      // 获取全局配置
      svgGlobalConfig = getConfig()
      //电池堆点击设备的填充
      if (!path.includes('accumulator')) {
        d3.select("#storages").selectAll("g").each(function (item, index) {
          let target = d3.select(this).selectAll("rect")._groups[0][0];
          let locationX = target.getBBox().x;
          let locationY = target.getBBox().y;
          let height = target.getBBox().height;
          let width = target.getBBox().width;
          let svgPath = 'accumulator' + (index + 1);
          d3.select(this).append('a')
            .attr('onclick', "changeSvgPath(\'" + svgPath + "\')")
            .append('rect')
            .attr("x", locationX)
            .attr('y', locationY)
            .attr('height', height)
            .attr('width', width)
            .attr('onmouseover', 'showPointer()')
            .attr('onmouseout', 'hidePointer()')
            .style("fill-opacity", 0)
        })
      }
      //电池组点击设备的填充
      d3.select("#packs").selectAll("g").each(function (item, index) {
        let target = d3.select(this).selectAll("path")._groups[0][0];
        if (d3.select("#alisvg2")._groups[0][0] === null) {
          let locationX = target.getBBox().x;
          let locationY = target.getBBox().y;
          let height = target.getBBox().height;
          let width = target.getBBox().width;
          let attrId = d3.select(this).attr('id');
          let svgPath = attrId.split('s_')[0] + (index + 1);
          d3.select(this).append('a')
            .attr('onclick', "changeSvgPath(\'" + svgPath + "\')")
            .append("rect")
            .attr("x", locationX)
            .attr('y', locationY)
            .attr('height', height)
            .attr('width', width)
            .attr('onmouseover', 'showPointer()')
            .attr('onmouseout', 'hidePointer()')
            .style("fill-opacity", 0)
        }
      })

      //南自设备图形点号
      d3.select("#Analog").selectAll("metadata")
        .each(function (d, j) {
          let childs = this.children;
          let pn = childs[9];
          if (pn) {
            let pid = pn.textContent;
            if (pid) {
              analogArr.push(pid);
              analogXMLMap[pid] = this.nextElementSibling;
            }
          }
        });

      //阿里设备图形点号
      d3.select("#analogs").selectAll("g")
        .each(function (d, j) {
          let pid = this.attributes["pointNumber"]?.value;
          let childs = this.children;
          let ptext = childs[2];
          if (ptext !== undefined && ptext.children.length > 1) {
            ptext = ptext.children[1];
          }
          if (ptext) {
            if (pid) {
              analogArr.push(pid);
              analogXMLMap[pid] = ptext;
            }
          }
          if (childs.length > 0) {
            if (childs[1]) {
              let z = childs[1].children[1];
              // console.log(childs[1].children)
              if (z) {
                if (pid) {
                  analogArr.push(pid);
                  analogXMLMap[pid] = z;
                }
              }
            }else{
              if(childs[0]){
                let z = childs[0].children[1];
                // console.log(childs[1].children)
                if (z) {
                  if (pid) {
                    analogArr.push(pid);
                    analogXMLMap[pid] = z;
                  }
                }
              }
            }
          }
        });
      //南自设备图形点号
      d3.selectAll("text").each(function () {
        let point = this.lastElementChild;
        if (point && point.nodeName === 'pointNumber') {
          let pid = point.innerHTML;
          let type = "analog";
          if (point.attributes["type"]) {
            type = point.attributes["type"].nodeValue;
          }
          if (point.parentElement) {
            analogArr.push(pid);
            analogXMLMap[pid] = point.parentElement;
            if (type === "discrete") {
              analogTempMap[pid] = point.parentElement;
            } else if (type === "discretea") {
              analogTempMap[pid] = point.parentElement;
              discreteaMap[pid] = point.parentElement;
            } else if (type === "discreteb") {
              analogTempMap[pid] = point.parentElement;
              discretebMap[pid] = point.parentElement;
            } else if (type === "discretec") {
              analogTempMap[pid] = point.parentElement;
              discretecMap[pid] = point.parentElement;
            } else if (type === "discreted") {

              discretedMap[pid] = point.parentElement;
            }
          } else {
            console.log("nnnnnn=" + pid);
          }
        }
      });
      // //细的开关
      // d3.selectAll("g[zjuscada='switch']")
      //   .each(function () {
      //     const switchId = this.parentNode.id.split('#')[1];
      //     switchArr.push(switchId)
      //   });
      // //粗的开关
      // d3.selectAll("g[zjuscada='breaker']")
      //   .each(function (d, j) {
      //     const breakerId = this.parentNode.id.split('#')[1];
      //     breakerArr.push(breakerId)
      //   });
      //上外的开关
      d3.selectAll("[displayType='dircreted']")
        .each(function (d, j) {
          const disconnectorsId = this?.attributes?.pointNumber?.nodeValue;
          disconnectorsArr.push(disconnectorsId)
        });
      //特殊处理内容
      d3.selectAll("[estimateType='timedeal']")
        .each(function (d, j) {
          const estimateId = this.attributes.pointNumber?.nodeValue;
          estimateArr.push(estimateId)
        });
      d3.selectAll("[timeStampType='timeStamp']")
      .each(function (d, j) {
        const timeStampId = this.attributes.pointNumber?.nodeValue;
        timeStampArr.push(timeStampId)
      });
      //电池检测按钮
      d3.selectAll("g[type='button']")
        .each(function (d, j) {
          for (let i of this.children) {
            i.style.cursor = "pointer"
          }
        });
      // //初始化旋转元件
      // if (d3.select("#spin")._groups[0][0]) {
      //   let spins = d3.select("#spin")._groups[0][0].children;
      //   for (let spin of spins) {
      //     const newThis = d3.select(spin);
      //     const BBox = newThis._groups[0][0].getBBox();
      //     const pivotX = BBox.x + BBox.width * 0.5; //旋转中心X轴坐标
      //     const pivotY = BBox.y + BBox.height * 0.5;//旋转中心轴坐标
      //     let rotate = Math.random() * 180; //随机起始角度
      //     let oldTransform = d3.select("#spin").attr("transform"); //原始transform
      //     //旋转
      //     window.spinInterval = setInterval(() => {
      //       d3.select("#spin").attr("transform", oldTransform + " rotate(" + rotate + " " + pivotX + " " + pivotY + ")");
      //       rotate += 1
      //     }, 20)
      //   }
      // }
      //淘宝上外示意图旋转元器件
      if (d3.select(".rotation")._groups[0][0]) {
        let spinss = d3.select(".rotation")._groups[0][0].children;
        for (let spin1 of spinss) {
          const newThis = d3.select(spin1);
          const BBox = newThis._groups[0][0].getBBox();
          const pivotX = BBox.x + BBox.width * 0.5; //旋转中心X轴坐标
          const pivotY = BBox.y + BBox.height * 0.5;//旋转中心轴坐标
          let rotate = 0; //起始角度
          let oldTransform = newThis.attr("transform"); //原始transform
          //旋转
          window.spinInterval = setInterval(() => {
            newThis.attr("transform", oldTransform + " rotate(" + rotate + " " + pivotX + " " + pivotY + ")");
            rotate += 1
          }, 20)
        }
      }
      //水桶
      if (d3.selectAll("path[type='water']")) {
        d3.selectAll("path[type='water']")
          .each(function (d, j) {
            bucketIds[this.id] =  this.attributes.pointNumber?.value;
            waterBreaker.initWaterLevel(_getCircleProps(this.id), 0);
          });
      }
      //电流
      if (d3.selectAll("path[type='arrow']")) {
        let index = 0;
        d3.selectAll("path[type='arrow']").each(function (d, j) {
          if (d3.select("#" + this.id)._groups[0][0]) {
            arrowIds[this.id] =  this.attributes.pointNumber?.value
            // 创建流动光点
            let id = "arrow_" + this.id;
            let spot = innerSVG.select("g").append("g").attr("id", id);
            svgArrowMethod.appendArrow(spot, this.id, svgGlobalConfig['arrowType'])
            spot.attr("display", "none");   //首次生成后隐藏
            arrowStatus[id] = 1;  //初始化默认为正方向
          }
          index++;
        })
      }
      //蓝色电流
      if (d3.selectAll("path[type='blueArrow']")) {
        let index = 0;
        d3.selectAll("path[type='blueArrow']").each(function (d, j) {
          if (d3.select("#" + this.id)._groups[0][0]) {
            arrowIds[this.attributes.pointNumber?.value] = (this.id)
            // 创建流动光点
            let id = "arrow_" + this.id;
            let spot = innerSVG.select("#layer1").append("g").attr("id", id);
            spot.append("ellipse")//绘制光点
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("fill", "#53F9FF")
              .append("animateMotion")  //穿件动画元素
              .attr("dur", (1 + 0.9) * 2 + "s")
              .attr("repeatCount", "indefinite")
              .attr("rotate", "auto")
              .append("mpath")
              .attr("xlink:href", "#" + this.id);//选择运动轨迹
            spot.attr("display", "none");   //首次生成后隐藏
            spot.append("ellipse")//绘制光点
              .attr("cx", 0)
              .attr("cy", 0)
              .attr("rx", 8)
              .attr("ry", 8)
              .attr("fill", "#53F9FF")
              .attr("filter", "blur(4px)")
              .append("animateMotion")  //穿件动画元素
              .attr("dur", (1 + 0.9) * 2 + "s")
              .attr("repeatCount", "indefinite")
              .attr("rotate", "auto")
              .append("mpath")
              .attr("xlink:href", "#" + this.id);//选择运动轨迹
            spot.attr("display", "none");   //首次生成后隐藏
            arrowStatus[id] = 1;  //初始化默认为正方向
          }
          index++;
        })
      }
      innerSVG.call(zoom);
      if (typeof (callBack) === "function") {
        valueGather = { switchArr, breakerArr, analogArr, disconnectorsArr, estimateArr,timeStampArr }
        callBack(valueGather);
      }
      d3.select("#CN").attr("style", "display:none");

    })
  };

  render() {
    return (
      <div id={'svg'} className={"svg-div"} style={{ width: '100%', height: '100%' }}>
      </div>
    );
  }
}

export default SvgChart

function formatConfigValue(key, value) {
  if (key === 'waterValueMap' || key === 'arrowValueMap') {
    return transformEnumValue(value, val => Number(val))
  }
  return value
}

function transformEnumValue(value, format = (val) => val) {
  if (!value) return {}
  let map = {}
  value.split(';').forEach(item => {
    const [name, value] = item.split("=")
    map[name] = value ? format(value) : undefined
  })
  return map
}

function transformValueByEnum(value, enumMap = {}) {
  if (typeof enumMap !== 'object' || enumMap === null) enumMap = {}
  const target = enumMap[value] ?? value
  return target
}
