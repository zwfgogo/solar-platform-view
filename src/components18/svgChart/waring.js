/**
 * Created by zhuweifeng on 2020/3/16.
 */

let d3 = require('d3');
//警告变色设置
window.index = [];
window.box = [];

const waringMethod = {
  //电池堆或电池组警告方法
  setColor: function (data, index) {
    index = setInterval(function () {
      if (data.style.fill === "rgb(0, 0, 0)") {
        data.style.fill = "rgb(234, 32, 0)";
        // data.parentElement.previousElementSibling.style.fill = "rgb(234, 32, 0)";
        //data.parentElement.previousElementSibling.previousElementSibling.style.fill="rgb(234, 32, 0)";
      } else {
        data.style.fill = "rgb(0, 0, 0)";
        // data.parentElement.previousElementSibling.style.fill = "rgb(0, 0, 0)";
        //data.parentElement.previousElementSibling.previousElementSibling.style.fill="rgb(255, 255, 255)";
      }
    }, 300);
    window.index.push(index);
  },
  setBoxColor: function (data, index) {
    index = setInterval(function () {
      if (data.style.fill === 'none') {//判断电池堆
        if (data.style.stroke === 'rgb(0, 255, 0)') {
          data.style.stroke = 'rgb(234, 32, 0)';
        } else {
          data.style.stroke = 'rgb(0, 255, 0)';
        }
      } else {//判断电池组
        if (data.style.fill === 'rgb(0, 255, 0)' && data.style.stroke === 'rgb(0, 255, 0)') {
          data.style.stroke = 'rgb(234, 32, 0)';
          data.style.fill = 'rgb(234, 32, 0)';
        } else {
          data.style.stroke = 'rgb(0, 255, 0)';
          data.style.fill = 'rgb(0, 255, 0)';
        }
      }

    }, 300);
    window.box.push(index);
  },
  // 恢复常态
  resColor: function (data) {
    data.style.fill = "rgb(0, 0, 0)";
    if (d3.select("#alisvg2")._groups[0][0] === null) {
      data.style.fill = "rgb(0, 0, 0)";
      data.parentElement.previousElementSibling.style.fill = "rgb(0, 0, 0)";
    }
    d3.selectAll("[displayType='dircreteb']")
        .each(function (d, j) {
          this.style.fill = "rgb(0, 0, 0)";
          data.parentElement.previousElementSibling.style.fill = "rgb(0, 0, 0)";
        });
    //data.parentElement.previousElementSibling.previousElementSibling.style.fill="rgb(255, 255, 255)";
  },
  resBoxColor: function (data) {
    if (data.style.stroke === 'rgb(234, 32, 0)') {
      data.style.stroke = 'rgb(0, 255, 0)';
    }
  },
  clearTwinkle: function () {
    for (let i in window.index) {
      window.clearInterval(window.index[i])
    }
    for (let i in window.box) {
      window.clearInterval(window.box[i])
    }
  },
};

export default waringMethod;
