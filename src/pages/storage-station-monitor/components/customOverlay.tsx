import React from "react";
import ReactDOM from "react-dom";
import MapInfoCard from "./mapInfoCard";

export function ComplexCustomOverlay(point, info) {
  this._point = point;
  this._info = info;
}
ComplexCustomOverlay.prototype = new BMap.Overlay();
ComplexCustomOverlay.prototype.initialize = function(map) {
  this._map = map;
  const div = (this._div = document.createElement("div"));
  ReactDOM.render(<MapInfoCard info={this._info} />, div);
  div.style.position = "absolute";
  div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
  this._map.getPanes().labelPane.appendChild(div);
  /**
   * 用于判断是否点击的是自定义窗口
   * 如果用阻止冒泡的方式，会导致点击完自定义窗口后需要点击两次地图才能触发mapClick
   * 用MapClickTarget标识当前点击对象是自定义窗口
   */
  div.addEventListener("click", e => {
    (window as any).MapClickTarget = "custom";
    // e.stopPropagation();
  });

  return div;
};
ComplexCustomOverlay.prototype.draw = function() {
  const map = this._map;
  const pixel = map.pointToOverlayPixel(this._point);
  this._div.style.left = pixel.x + 20 + "px";
  this._div.style.top = pixel.y - 120 + "px";
};
