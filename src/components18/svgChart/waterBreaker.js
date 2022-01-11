/**
 * Created by zhuweifeng on 2020/3/16.
 */
//svg水桶
let water_gauge;
let gaugeObject = [];
let d3 = require('d3');

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

function liquidFillGaugeDefaultSettings(id) {
  let props = _getCircleProps(id);
  let {outerRect, innerRect, innerCircle, outerCircle} = props;
  return {
    minValue: 0, // The gauge minimum value.
    maxValue: 100, // The gauge maximum value.
    circleThickness: 0.005, // The outer circle thickness as a percentage of it's radius.
    circleFillGap: 0.005, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
    outerColor: outerCircle.fillColor || "rgba(54,54,54,0.4)", // The color of the outer circle.
    waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
    waveCount: 1, // The number of full waves per width of the wave circle.
    waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
    waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
    waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
    waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
    waveAnimate: true, // Controls if the wave scrolls or is static.
    waveColor: innerCircle.fillColor || "rgba(85, 180, 255,0.5)", // The color of the fill wave.
    waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
    textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
    textSize: props.textSize || 0.8, // font size of text. like:56%
    valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
    displayPercent: true, // If true, a % symbol is displayed after the value.
    textColor: props.tectColor || "#000", // The color of the value text when the wave does not overlap it.
    waveTextColor: props.waveTextColor || "#000", // The color of the value text when the wave overlaps it.

    innerCircleR: innerCircle.r || 80,  //the radius of inner circle
    outerCircleR: outerCircle.r || 80  //the radius of outer circle
  };
}

function loadLiquidFillGauge(elementId, value, config) {
  if (config == null) config = this.liquidFillGaugeDefaultSettings(elementId);

  let gauge = d3.select("#" + elementId);
  let target = d3.select('#' + elementId)._groups[0][0];
  
  let waterColor = target.attributes?.waterColor?.value;
  let waterText = target.attributes?.waterText?.value
  let locationX = target.getBBox().x;
  let locationY = target.getBBox().y;
  let height = target.getBBox().height;
  let width = target.getBBox().width;
  let radius = width / 2;
  let fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

  let waveHeightScale;
  // if(config.waveHeightScaling){
  waveHeightScale = d3.scaleLinear()
      .range([0, config.waveHeight, 0])
      .domain([0, 50, 100]);
  // } else {
  //   waveHeightScale = d3.scaleLinear()
  //     .range([config.waveHeight,config.waveHeight])
  //     .domain([0,100]);
  // }

  let textPixels = (config.textSize * radius / 2);
  let textFinalValue = parseFloat(value).toFixed(2);
  let textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
  let percentText = config.displayPercent ? "%" : "";
  let circleThickness = config.circleThickness * radius;
  let circleFillGap = config.circleFillGap * radius;
  let fillCircleMargin = circleThickness + circleFillGap;
  let fillCircleRadius = radius - fillCircleMargin;
  let fillHeight = height - fillCircleMargin;
  let waveHeight = fillHeight * waveHeightScale(fillPercent * 100);

  let waveLength = width / config.waveCount;
  let waveClipCount = 1 + config.waveCount;
  let waveClipWidth = waveLength * waveClipCount;

  // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
  let textRounder = function (value) {
    return Math.round(value);
  };
  if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
    textRounder = function (value) {
      return parseFloat(value).toFixed(1);
    };
  }
  if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
    textRounder = function (value) {
      return parseFloat(value).toFixed(2);
    };
  }

  // Data for building the clip wave area.
  let data = [];
  for (let i = 0; i <= 40 * waveClipCount; i++) {
    data.push({x: i / (40 * waveClipCount), y: (i / (40))});
  }

  // Scales for drawing the outer Rect.
  let gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
  let gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

  // Scales for controlling the size of the clipping path.
  let waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
  let waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

  // Scales for controlling the position of the clipping path.
  let waveRiseScale = d3.scaleLinear()
  // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
  // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
  // circle at 100%.
      .range([(fillCircleMargin + fillHeight + waveHeight), (fillCircleMargin - waveHeight)])
      .domain([0, 1]);
  let waveAnimateScale = d3.scaleLinear()
      .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
      .domain([0, 1]);

  // Scale for controlling the position of the text within the gauge.
  let textRiseScaleY = d3.scaleLinear()
      .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
      .domain([0, 1]);
  let parentId = "#" + d3.select("#" + elementId)._groups[0][0].parentNode.id
  //如果电池有背景色，插入到背景色下一层(path)
  let gaugeGroup = d3.select(parentId).insert("g", 'path:nth-of-type(2)')
      .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

  // // Draw the outer circle.
  // gaugeGroup.append("rect")
  //     .attr("x", 0)
  //     .attr('y', 0)
  //     .attr('height', height)
  //     .attr('width', 2 * gaugeCircleY(radius))
  //     .attr('display', 'none')
  //     .style("fill", config.outerColor)
  //     .style("opacity", 0.7)
  // Text where the wave does not overlap.
  let text1 = ''
  if(!waterText){
     text1 = gaugeGroup.append("text")
      .text(textRounder(Math.round(textStartValue)) + percentText)
      // .attr("class", "liquidFillGaugeText")
      .attr("text-anchor", "middle")
      .attr("font-size", textPixels + "px")
      .attr("stroke-width", "0.1")
      .style("fill", config.textColor)
      .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
  }
 

  // The clipping wave area.
  let clipArea = d3.area()
      .x(function (d) {
        return waveScaleX(d.x);
      })
      .y0(function (d) {
        return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
      })
      .y1(function (d) {
        return (fillHeight + waveHeight);
      });
  let waveGroup = gaugeGroup.append("defs")
      .append("clipPath")
      .attr("id", "clipWave" + elementId);

  let wave = waveGroup.append("path")
      .datum(data)
      .attr("d", clipArea)
      .attr("T", 0);
  // The inner rect with the clipping wave attached.
  let fillCircleGroup = gaugeGroup.append("g")
      .attr("clip-path", "url(#clipWave" + elementId + ")");
  if (elementId === "path5967") {
    fillCircleGroup.append("rect")
        .attr("x", radius - fillCircleRadius)
        .attr('y', radius - fillCircleRadius)
        .attr('height', fillHeight)
        .attr('width', 2 * fillCircleRadius)
        .style("fill", "rgba(0,239,152,255)");
  } else {
    fillCircleGroup.append("rect")
        .attr("x", radius - fillCircleRadius)
        .attr('y', radius - fillCircleRadius)
        .attr('height', fillHeight)
        .attr('width', 2 * fillCircleRadius)
        .style("fill", waterColor?waterColor:config.waveColor);
  }

  // fillCircleGroup.append("rect")
  //   .attr("x", radius-fillCircleRadius -2)
  //   .attr('y',radius-fillCircleRadius - 20)
  //   .attr('height',fillHeight)
  //   .attr('width',2*fillCircleRadius)
  //   .style("fill", "rgb(158,165,148)");

  // Text where the wave does overlap.
  // let text2 = fillCircleGroup.append("text")
  //     .text(textRounder(textStartValue) + percentText)
  //     // .attr("class", "liquidFillGaugeText")
  //     .attr("text-anchor", "middle")
  //     .attr("stroke-width", "0.1")
  //     .attr("font-size", textPixels + "px")
  //     .style("fill", config.waveTextColor)
  //     .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

  // Make the value count up.
  if (config.valueCountUp) {
    let textTween = function () {
      let i = d3.interpolate(this.textContent, textFinalValue);
      let self = this;
      return function (t) {
        self.textContent = textRounder(i(t)) + percentText;
      }
    };
    if(!waterText){
      text1.transition()
      .duration(config.waveRiseTime)
      .tween("text", textTween);
    }
    
    // text2.transition()
    //     .duration(config.waveRiseTime)
    //     .tween("text", textTween);
  }

  // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
  let waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
  if (config.waveRise) {
    waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
        .transition()
        .duration(config.waveRiseTime)
        .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
        .on('start', function (d, i) {
          wave.attr('transform', 'translate(1,0)');
        }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
  } else {
    waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
  }
  if (config.waveAnimate) animateWave();

  function animateWave() {
    wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
    wave.transition()
        .duration(config.waveAnimateTime * (1 - wave.attr('T')))
        .ease(d3.easeLinear)
        .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
        .attr('T', 1)
        .on('end', function (d, i) {
          wave.attr('T', 0);
          animateWave(config.waveAnimateTime);
        });
  }

  function GaugeUpdater() {
    this.update = function (value) {
      let newFinalValue = parseFloat(value).toFixed(2);
      let textRounderUpdater = function (value) {
        return Math.round(value);
      };
      if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
        textRounderUpdater = function (value) {
          if (value === 'NaN') {
            return ''
          } else {
            return parseFloat(value).toFixed(1);
          }
        };
      }
      if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
        textRounderUpdater = function (value) {
          if (value === 'NaN') {
            return ''
          } else {
            return parseFloat(value).toFixed(2);
          }
        };
      }

      let textTween = function () {
        let i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
        let self = this;
        if (value === null) {
          return function (t) {
            self.textContent = textRounderUpdater(i(t));
          }
        } else {
          return function (t) {
            self.textContent = textRounderUpdater(i(t)) + percentText;
          }
        }
      };
      if(!waterText){
      text1.transition()
          .duration(config.waveRiseTime)
          .tween("text", textTween);
      }
      // text2.transition()
      //     .duration(config.waveRiseTime)
      //     .tween("text", textTween);

      let fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
      let waveHeight = fillHeight * waveHeightScale(fillPercent * 100);
      let waveRiseScale = d3.scaleLinear()
      // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
      // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
      // circle at 100%.
          .range([(fillCircleMargin + fillHeight + waveHeight), (fillCircleMargin - waveHeight)])
          .domain([0, 1]);
      let newHeight = waveRiseScale(fillPercent);
      let waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
      let waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
      let newClipArea;

      let clipArea = d3.area()
          .x(function (d) {
            return waveScaleX(d.x);
          })
          .y0(function (d) {
            return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
          })
          .y1(function (d) {
            return (fillHeight + waveHeight);
          });

      let newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
      wave.transition()
          .duration(0)
          .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
          .ease(d3.easeLinear)
          .attr('d', clipArea)
          .attr('transform', 'translate(' + newWavePosition + ',0)')
          .attr('T', '1')
          .on('end', function (d, i) {
            if (config.waveAnimate) {
              wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
              animateWave(config.waveAnimateTime);
            }

          });
      waveGroup.transition()
          .duration(config.waveRiseTime)
          .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')')
    }
  }

  return new GaugeUpdater();
}

function initWaterLevel(cfg, value) {
  let {idDom, width, height} = cfg;
  // let target = d3.select('#'+idDom)._groups[0][0];
  let config = liquidFillGaugeDefaultSettings(idDom);
  config.circleThickness = 0.05;
  config.textVertPosition = 0.2;
  config.waveAnimateTime = 1000;
  water_gauge = loadLiquidFillGauge(idDom, value, config);
  gaugeObject.push({id: idDom, gauge: water_gauge})
}

export default {gaugeObject,initWaterLevel}
