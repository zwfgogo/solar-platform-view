/**
 * Created by zhuweifeng on 2020/3/16.
 */
 let d3 = require('d3');
 const ArrowType = {
   blue_arrow: 'blue-arrow',
 }

 const svgArrowMethod = {
   appendArrow: function(container, href, arrowType) {
      let path
      if (arrowType === ArrowType.blue_arrow) {
        path = container.append("path")//绘制光点
        .attr("d", "M4.44883 6.67264 L0.585778 10.5357 L2.7628 12.7127 L8.8018 6.67249 L2.76272 0.633405 L0.585693 2.81044 L4.44883 6.67264 Z")
        .attr("transform", "translate(0,-6.5)")
        .attr("fill", "#2E98D9")
      } else {
        path = container.append("path")//绘制光点
        .attr("d", "M 0,5 10,0 0,-5z")
        .attr("fill", "#93ff5c")
      }

      const targetPath = d3.select(`path#${href}`).node()
      const pathLen = targetPath.getTotalLength()
      const speed = 57
      let time = pathLen ? (pathLen / speed).toFixed(3) : '1.9'

      path.append("animateMotion")  //穿件动画元素
        .attr("dur", time + "s")
        .attr("repeatCount", "indefinite")
        .attr("rotate", "auto")
        .append("mpath")
        .attr("xlink:href", "#" + href);//选择运动轨迹
    },
 };
 
 export default svgArrowMethod;