import React, { Component } from 'react';
import styles from './styles/google-map-content.less';
import { Point, hasPos } from './powerStationMap';
import ImgMapPoint from "../../../../static/img/map-point.png";
import ImgActiveMapPoint from "../../../../static/img/map-point-active.png";

let MAP_ACTIVE_POINT_ICON
let MAP_POINT_ICON
googlePromise.then(() => {
  MAP_ACTIVE_POINT_ICON = {
    url: ImgActiveMapPoint,
    size: new google.maps.Size(67, 44),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(34, 30)
  };
  MAP_POINT_ICON = {
    url: ImgMapPoint,
    size: new google.maps.Size(21, 28),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(12.4, 29)
  }
})

interface Props {
  pointList: Point[]
  setActiveMapPoint: (key?: string, node?: Point) => void
  activeNode: Point
  visible: boolean
}

class GoogleMapContent extends Component<Props> {
  chartRef = React.createRef<HTMLDivElement>();
  map: any;
  lastActiveMapPointId: number;
  activeMapPointPos: any;
  activeMapPointInfo: any;
  markerList: any[] = [];
  activeMarker: any;

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
    const uluru = {lat: -25.344, lng: 131.036};
    // this.drawMap(uluru);
    this.initPosition()
      .then(cityPoint => {
        if(this.chartRef.current) {
          this.drawMap(cityPoint);
        }
      })
      .catch((e) => {
        this.drawMap(uluru);
      });
  }

  componentWillUnmount() {
  }

  showPointInfo = (node, holdScale?: boolean, noCenter?: boolean) => {
    if (this.map) {
      const pos = {
        lng: node.coordinate[0],
        lat: node.coordinate[1]
      };
      this.drawActiveMapPoint(pos, node);
      if(noCenter) return;
      this.map.setCenter(pos);
      if (!holdScale) {
        this.map.setZoom(8)
      }
    }
  }

  // 清除选中状态
  clearSelectStatus = () => {
    if(this.props.activeNode) {
      this.props.setActiveMapPoint(null);
    }
    this.lastActiveMapPointId = null;
    if (this.activeMarker) {
      this.activeMarker.setMap(null);
      // this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo);
      this.activeMarker = null;
      this.activeMapPointPos = null;
      this.activeMapPointInfo = null;
    }
  }

  initPosition = () => {
    return new Promise((resolve, reject) => {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(pos);
        }, function() {
          reject();
        });
      } else {
        reject();
      }
    });
  }

  // 绘制选中点
  drawActiveMapPoint = (pos, point) => {
    if (this.activeMarker) {
      this.activeMarker.setMap(null);
      // this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo);
    }
    this.lastActiveMapPointId = point.id;
    this.activeMapPointPos = pos;
    this.activeMapPointInfo = point;

    this.activeMarker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: MAP_ACTIVE_POINT_ICON
    });
    this.activeMarker.setZIndex(999)
    this.activeMarker.addListener("click", () => {
    });
  };

  drawMapPoint = (pos, point) => {
    var marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: MAP_POINT_ICON
    });
    this.lastActiveMapPointId = point.id;
    this.markerList.push(marker);
    marker.addListener('click', () => {
      // this.lastActiveMapPointId = point.id;
      this.showPointInfo(point, true, true);
      this.props.setActiveMapPoint(point.id?.toString(), point);
    });
  }

  drawPoint = () => {
    if (this.map) {
      const { pointList } = this.props;
      this.markerList.forEach(marker => marker.setMap(null));
      this.markerList = [];
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

  mapClick = (e) => {
    this.clearSelectStatus();
  }

  drawMap = point => {
    this.map = new google.maps.Map(this.chartRef.current, {
      center: point,
      zoom: 8,
      disableDefaultUI: true,
      mapTypeId: 'satellite'
    });
    this.drawPoint();
    this.map.addListener('click', this.mapClick);
  };

  render() {
    return (
      <div className={styles["page-container"]} style={this.props.visible ? {} : {display: 'none'}}>
        <div className={styles["map-container"]} ref={this.chartRef}></div>
      </div>
    );
  }
}

export default GoogleMapContent;