import React, { Component } from 'react';
import styles from './styles/bmap-content.less';
import { hasPos, Point } from './powerStationMap';
import ImgMapPoint from "../../../../static/img/map-point.png";
import ImgActiveMapPoint from "../../../../static/img/map-point-active.png";
import { ComplexCustomOverlay } from './customOverlay';

const BMap = window.BMap;
const BMAP_SATELLITE_MAP = (window as any).BMAP_SATELLITE_MAP;

const MAP_ACTIVE_POINT_SIZE = new BMap.Size(67, 44);
const MAP_ACTIVE_POINT_OFFSET = new BMap.Size(34, 30);
const MAP_ACTIVE_IMG_OFFSET = new BMap.Size(-0, -0);

const MAP_POINT_SIZE = new BMap.Size(21, 28);
const MAP_POINT_OFFSET = new BMap.Size(12, 28);
const MAP_IMG_OFFSET = new BMap.Size(-0, 0);


interface Props {
  pointList: Point[]
  setActiveMapPoint: (key?: string, node?: Point) => void
  activeNode: Point
  visible: boolean
}

class BmapContent extends Component<Props> {
  chartRef = React.createRef<HTMLDivElement>();
  map: any;
  myCompOverlay: any;
  activeMapPoint: any;
  activeMapPointPos: any;
  activeMapPointInfo: any;
  lastActiveMapPointId: number;

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (
      JSON.stringify(this.props.pointList) !==
      JSON.stringify(prevProps.pointList)
    ) {
      this.drawPoint();
    }
    if (
      this.props.activeNode &&
      this.props.activeNode?.id !==
      prevProps.activeNode?.id &&
      this.props.activeNode?.id !== this.lastActiveMapPointId
    ) {
      this.showPointInfo(this.props.activeNode);
    } else if(!this.props.activeNode && prevProps.activeNode) {
      this.clearSelectStatus();
    }
  }

  componentDidMount() {
    this.initPosition().then(cityPoint => {
      this.drawMap(cityPoint);
    });
  }

  componentWillUnmount() {
  }

  // 获取当前位置信息
  initPosition = () => {
    return new Promise(r => {
      const getCurrentCity = result => {
        r(result.center);
      };
      const myCity = new BMap.LocalCity();
      myCity.get(getCurrentCity);
    });
  };

  drawMap = point => {
    this.map = new BMap.Map(this.chartRef.current, { enableMapClick: false });
    const bMapPoint = new BMap.Point(point.lng, point.lat); // 创建点坐标
    this.map.centerAndZoom(bMapPoint, 7); // 初始化地图,设置中心点坐标和地图级别。
    this.map.enableScrollWheelZoom();
    this.map.setMapType(BMAP_SATELLITE_MAP);
    setTimeout(() => {
      this.drawPoint();
      if (this.props.activeNode) {
        this.showPointInfo(this.props.activeNode);
      }
    });
    this.map.addEventListener("click", this.mapClick);
    this.map.addEventListener("dragend", this.mapDragend);
  };

  mapDragend = e => {
    /* 地图拖动会触发自定义窗口的点击事件，重置点击状态 */
    setTimeout(() => {
      (window as any).MapClickTarget = null;
    });
  };

  mapClick = e => {
    if (e.overlay) return;
    /**
     * 用于判断是否点击的是自定义窗口
     * 如果用阻止冒泡的方式，会导致点击完自定义窗口后需要点击两次地图才能触发mapClick
     * 用MapClickTarget标识当前点击对象是自定义窗口
     */
    if ((window as any).MapClickTarget === "custom") {
      (window as any).MapClickTarget = null;
      return;
    }
    this.clearSelectStatus();
  };

  // 清除选中状态
  clearSelectStatus = () => {
    if(this.props.activeNode) {
      this.props.setActiveMapPoint(null);
    }
    this.lastActiveMapPointId = null;
    // this.myCompOverlay && this.myCompOverlay.remove();
    if (this.activeMapPoint) {
      this.activeMapPoint.remove();
      // this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo);
      this.activeMapPoint = null;
      this.activeMapPointPos = null;
      this.activeMapPointInfo = null;
    }
  }

  // 绘制选中点
  drawActiveMapPoint = (pos, point) => {
    const bMapPoint = new BMap.Point(pos.lng, pos.lat);
    if (this.activeMapPoint) {
      this.activeMapPoint.remove();
      // this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo);
    }
    this.lastActiveMapPointId = point.id;
    this.activeMapPointPos = pos;
    this.activeMapPointInfo = point;
    var myIcon = new BMap.Icon(ImgActiveMapPoint, MAP_ACTIVE_POINT_SIZE, {
      anchor: MAP_ACTIVE_POINT_OFFSET,
      imageOffset: MAP_ACTIVE_IMG_OFFSET
    });
    this.activeMapPoint = new BMap.Marker(bMapPoint, { icon: myIcon });
    this.activeMapPoint.setZIndex(99);
    this.activeMapPoint.addEventListener("click", e => {
      // this.showPointInfo(point, true);
    });
    this.map.addOverlay(this.activeMapPoint);
  };

  showPointInfo = (node, holdScale?: boolean) => {
    if (this.map) {
      const bMapPoint = new BMap.Point(node.coordinate[0], node.coordinate[1]); // 创建点坐标
      // this.props.setActiveMapPoint(node.id?.toString(), node);
      this.drawActiveMapPoint(
        {
          lng: node.coordinate[0],
          lat: node.coordinate[1]
        },
        node
      );
      if (holdScale) {
        this.map.centerAndZoom(bMapPoint);
      } else {
        this.map.centerAndZoom(bMapPoint, 7);
      }
      // this.myCompOverlay && this.myCompOverlay.remove();
      // this.myCompOverlay = new ComplexCustomOverlay(bMapPoint, node);
      // this.map.addOverlay(this.myCompOverlay);
    }
  }

  // 绘制未选中点
  drawMapPoint = (pos, point) => {
    const bMapPoint = new BMap.Point(pos.lng, pos.lat);
    var myIcon = new BMap.Icon(ImgMapPoint, MAP_POINT_SIZE, {
      anchor: MAP_POINT_OFFSET,
      imageOffset: MAP_IMG_OFFSET
    });
    const marker = new BMap.Marker(bMapPoint, { icon: myIcon });
    marker.setZIndex(98);
    marker.addEventListener("click", e => {
      console.log("click");
      // e.domEvent.stopPropagation();
      // marker.remove();
      this.lastActiveMapPointId = point.id;
      this.showPointInfo(point, true);
      this.props.setActiveMapPoint(point.id?.toString(), point);
    });
    this.map.addOverlay(marker);
  };

  drawPoint = () => {
    if (this.map) {
      const { pointList } = this.props;
      this.map.clearOverlays();
      pointList.forEach(point => {
        if (!hasPos(point)) return;
        this.drawMapPoint(
          {
            lng: point.coordinate[0],
            lat: point.coordinate[1]
          },
          point
        );
      });
    }
  };

  render() {
    return (
      <div className={styles["map-container"]} ref={this.chartRef} style={this.props.visible ? {} : {display: 'none'}}></div>
    );
  }
}

export default BmapContent;