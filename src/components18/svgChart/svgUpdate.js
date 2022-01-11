/**
 * Created by zhuweifeng on 2020/3/16.
 */
let d3 = require('d3');

const svgUpdateMethod = {
  analogValueChange: function (analogValueArr, analogXMLMap, discretebMap, discreteaMap, analogTempMap) {
    if (analogValueArr) {
      for (let o of analogValueArr) {
        if (!analogXMLMap[o.name]) continue;
        if (analogXMLMap[o.name].firstElementChild === null) {
          const preText = analogXMLMap[o.name].innerHTML;
          if (o.value === '-0.0') {
            o.value = o.value.split('-')[1];
          }
          if (preText.indexOf(":") > -1) {
            analogXMLMap[o.name].innerHTML = preText.split(":")[0] + ": " + o.value;
          } else if (preText.indexOf("：") > -1) {
            analogXMLMap[o.name].innerHTML = preText.split("：")[0] + ": " + o.value;
          } else if (preText === "0.0") {
            analogXMLMap[o.name].innerHTML = preText.replace("0.0", "") + o.value;
          } else {
            if (analogTempMap[o.name]) {
              analogXMLMap[o.name].innerHTML = preText + ": " + o.value;
            } else {
              analogXMLMap[o.name].innerHTML = o.value;
            }
          }
          if (discreteaMap[o.name]) {
            analogXMLMap[o.name].previousElementSibling.setAttribute("style", o.value === '1.0' ? "fill:#ee4170;fill-opacity:1" : "fill:#26e674;fill-opacity:1");
          } else if (discretebMap[o.name]) {
            analogXMLMap[o.name].parentElement.lastElementChild.setAttribute("style", o.value === '1.0' ? "fill:#08ba9e;fill-opacity:1;stroke-width:0.00297222" : "fill:#08ba9e;fill-opacity:0;stroke-width:0.00297222"
            );
          }
        } else {
          const preText = analogXMLMap[o.name].firstElementChild.innerHTML;
          if (o.value === '-0.0') {
            o.value = o.value.split('-')[1];
          }
          if (preText.indexOf(":") > -1) {
            analogXMLMap[o.name].firstElementChild.innerHTML = preText.split(":")[0] + ": " + o.value;
          } else if (preText.indexOf("：") > -1) {
            analogXMLMap[o.name].firstElementChild.innerHTML = preText.split("：")[0] + ": " + o.value;
          } else if (preText === "0.0") {
            analogXMLMap[o.name].firstElementChild.innerHTML = preText.replace("0.0", "") + o.value;
          } else {
            if (analogTempMap[o.name]) {
              analogXMLMap[o.name].firstElementChild.innerHTML = preText + ": " + o.value;
            } else {
              analogXMLMap[o.name].firstElementChild.innerHTML = o.value;
            }
          }
          if (discreteaMap[o.name]) {
            analogXMLMap[o.name].previousElementSibling.firstElementChild.setAttribute("style", o.value === '1.0' ? "fill:#ee4170;fill-opacity:1" : "fill:#26e674;fill-opacity:1");
          } else if (discretebMap[o.name]) {
            analogXMLMap[o.name].parentElement.lastElementChild.setAttribute("style", o.value === '1.0' ? "fill:#08ba9e;fill-opacity:1;stroke-width:0.00297222" : "fill:#08ba9e;fill-opacity:0;stroke-width:0.00297222"
            );
          }
        }
      }
    }
  },
  //1闭合 0和空为断开
  disconnectorsValueChange: function (disconnectorsValueArr) {
    if (disconnectorsValueArr) {
      for (let o of disconnectorsValueArr) {
        if (o.value === 0 || o.value === '') {
          d3.selectAll("[displayType='dircreted']")
            .each(function (d, j) {
              const disconnectorsId = this?.attributes?.pointNumber?.nodeValue;
              const that = this;
              if (disconnectorsId === o.name) {
                //上外开关状态变化
                d3.selectAll("[scadaType='disconnectors']")
                  .each(function (d, j) {
                    const breakPoint = this.attributes['pointNumber'] ?.value;
                    if (that.attributes['pointNumber'].value === breakPoint) {
                      this.childNodes[3].lastElementChild.attributes.d.nodeValue = "M 36.557685,565.71162 27.960603,558.38944 14.062362,546.55222";
                      this.childNodes[3].childNodes[3].attributes.style.nodeValue =
                        "fill:#1ccb2a;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].childNodes[5].childNodes[1].attributes.style.nodeValue =
                        "fill:#1ccb2a;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].childNodes[5].childNodes[3].attributes.style.nodeValue =
                        "fill:#1ccb2a;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].lastElementChild.attributes.style.nodeValue =
                        "fill:none;fill-rule:evenodd;stroke:#1ccb2a;stroke-width:2.54278684px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:0.94117647";
                      this.childNodes[3].childNodes[9].attributes.style.nodeValue =
                        "fill:#1ccb2a;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                    }
                  });
              }
            });
        }
        else if (o.value === 1 || o.value === 255) {
          d3.selectAll("[displayType='dircreted']")
            .each(function (d, j) {
              const disconnectorsId = this?.attributes?.pointNumber?.nodeValue;
              const that = this;
              if (disconnectorsId === o.name) {
                //上外开关状态变化
                d3.selectAll("[scadaType='disconnectors']")
                  .each(function (d, j) {
                    const breakPoint = this.attributes['pointNumber'] ?.value;
                    if (that.attributes['pointNumber'].value === breakPoint) {
                      this.childNodes[3].lastElementChild.attributes.d.nodeValue = "M 35.962086,566.2802 C 27.097427,531.52853 27.097427,531.52853 27.097427,531.52853";
                      this.childNodes[3].childNodes[3].attributes.style.nodeValue =
                        "fill:#ff0000;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].childNodes[5].childNodes[1].attributes.style.nodeValue =
                        "fill:#ff0000;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].childNodes[5].childNodes[3].attributes.style.nodeValue =
                        "fill:#ff0000;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                      this.childNodes[3].lastElementChild.attributes.style.nodeValue =
                        "fill:none;fill-rule:evenodd;stroke:#ff0000;stroke-width:2.54278684px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:0.94117647";
                      this.childNodes[3].childNodes[9].attributes.style.nodeValue =
                        "fill:#ff0000;fill-opacity:0.94117647;fill-rule:nonzero;stroke:none;stroke-width:1.18042171px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1";
                    }
                  });
              }
            });
        }
      }
    }
  },
  estimateValueChange:function (estimateValueArr) {
    if(estimateValueArr){
      for (let o of estimateValueArr) {
        d3.selectAll("[estimateType='timedeal']")
            .each(function (d, j) {
              if(this.attributes['pointNumber'].value === o.name){
                this.lastElementChild.firstElementChild.innerHTML = o.value
              }
            })
      }
    }
  },
};

export default svgUpdateMethod;
