import React, {Component} from 'react'
import {connect} from 'dva'
import {message} from 'wanke-gui'
import {ComplexCustomOverlay} from './customOverlay'
import ImgMapPoint from '../../../static/img/map-point.png'
import ImgActiveMapPoint from '../../../static/img/map-point-active.png'
import FullScreenBtn from '../../../components/FullScreenBtn'
import CommonStationTree from '../../../components/common-station-tree/CommonStationTree'
import styles from './styles/powerStationMap.less'
import {makeConnect} from '../../umi.helper'
import {storage_station_monitor} from '../../constants'

const BMap = window.BMap
const BMAP_SATELLITE_MAP = (window as any).BMAP_SATELLITE_MAP

const MAP_POINT_SIZE = new BMap.Size(21, 28)
const MAP_POINT_OFFSET = new BMap.Size(12, 28)

const MAP_ACTIVE_POINT_SIZE = new BMap.Size(67, 44)
const MAP_ACTIVE_POINT_OFFSET = new BMap.Size(34, 30)

function hasPos(point) {
  return point && point.coordinate && point.coordinate[0] && point.coordinate[1]
}

interface Point {
  longitude: number;
  latitude: number;
  coordinate: number[];
}

interface Props {
  action: any;
  pointList: Point[];
  style?: React.CSSProperties;
}

class PowerStationMap extends Component<Props> {
  chartRef = React.createRef<HTMLDivElement>()
  map: any
  myCompOverlay: any
  activeMapPoint: any
  activeMapPointPos: any
  activeMapPointInfo: any

  // 获取当前位置信息
  initPosition = () => {
    return new Promise(r => {
      const getCurrentCity = result => {
        r(result.center)
      }
      const myCity = new BMap.LocalCity()
      myCity.get(getCurrentCity)
    })
  }

  drawMap = point => {
    this.map = new BMap.Map(this.chartRef.current, {enableMapClick: false})
    const bMapPoint = new BMap.Point(point.lng, point.lat) // 创建点坐标
    this.map.centerAndZoom(bMapPoint, 7) // 初始化地图,设置中心点坐标和地图级别。
    this.map.enableScrollWheelZoom()
    this.map.setMapType(BMAP_SATELLITE_MAP)
    setTimeout(() => {
      this.drawPoint()
    })
    this.map.addEventListener('click', this.mapClick)
    this.map.addEventListener('dragend', this.mapDragend)
  }

  mapDragend = e => {
    /* 地图拖动会触发自定义窗口的点击事件，重置点击状态 */
    setTimeout(() => {
      (window as any).MapClickTarget = null
    })
  }

  mapClick = e => {
    if (e.overlay) return
    /**
     * 用于判断是否点击的是自定义窗口
     * 如果用阻止冒泡的方式，会导致点击完自定义窗口后需要点击两次地图才能触发mapClick
     * 用MapClickTarget标识当前点击对象是自定义窗口
     */
    if ((window as any).MapClickTarget === 'custom') {
      (window as any).MapClickTarget = null
      return
    }
    this.setActiveMapPoint(null)
    this.myCompOverlay && this.myCompOverlay.remove()
    if (this.activeMapPoint) {
      this.activeMapPoint.remove()
      this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo)
      this.activeMapPoint = null
      this.activeMapPointPos = null
      this.activeMapPointInfo = null
    }
  }

  drawPoint = () => {
    if (this.map) {
      const {pointList} = this.props
      this.map.clearOverlays()
      pointList.forEach(point => {
        if (!hasPos(point)) return
        this.drawMapPoint(
          {
            lng: point.coordinate[0],
            lat: point.coordinate[1]
          },
          point
        )
      })
    }
  }

  // 绘制未选中点
  drawMapPoint = (pos, point) => {
    const bMapPoint = new BMap.Point(pos.lng, pos.lat)
    var myIcon = new BMap.Icon(ImgMapPoint, MAP_POINT_SIZE, {
      anchor: MAP_POINT_OFFSET
    })
    const marker = new BMap.Marker(bMapPoint, {icon: myIcon})
    marker.addEventListener('click', e => {
      console.log('click')
      // e.domEvent.stopPropagation();
      this.treeNodeClick(point, true)
    })
    this.map.addOverlay(marker)
  }

  // 绘制选中点
  drawActiveMapPoint = (pos, point) => {
    const bMapPoint = new BMap.Point(pos.lng, pos.lat)
    if (this.activeMapPoint) {
      this.activeMapPoint.remove()
      this.drawMapPoint(this.activeMapPointPos, this.activeMapPointInfo)
    }
    this.activeMapPointPos = pos
    this.activeMapPointInfo = point
    var myIcon = new BMap.Icon(ImgActiveMapPoint, MAP_ACTIVE_POINT_SIZE, {
      anchor: MAP_ACTIVE_POINT_OFFSET
    })
    this.activeMapPoint = new BMap.Marker(bMapPoint, {icon: myIcon})
    this.activeMapPoint.addEventListener('click', e => {
      this.treeNodeClick(point, true)
    })
    this.map.addOverlay(this.activeMapPoint)
  }

  treeNodeClick = (node, holdScale?: boolean) => {
    if (hasPos(node)) {
      const bMapPoint = new BMap.Point(node.coordinate[0], node.coordinate[1]) // 创建点坐标
      this.setActiveMapPoint(node.id?.toString())
      this.drawActiveMapPoint(
        {
          lng: node.coordinate[0],
          lat: node.coordinate[1]
        },
        node
      )
      if (holdScale) {
        this.map.centerAndZoom(bMapPoint)
      } else {
        this.map.centerAndZoom(bMapPoint, 7)
      }
      this.myCompOverlay && this.myCompOverlay.remove()
      this.myCompOverlay = new ComplexCustomOverlay(bMapPoint, node)
      this.map.addOverlay(this.myCompOverlay)

      this.props.action("getStationData", {
        stationId: node.id + ''
      });

    } else {
      message.error('无位置信息')
      return false
    }
  }

  // 用于树展示选中点
  setActiveMapPoint = activeKey => {
    this.props.action('updateToView', {activeKey})
    this.props.dispatch({ type: 'stationTree/updateToView', payload: {activeKey} })
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (
      JSON.stringify(this.props.pointList) !==
      JSON.stringify(prevProps.pointList)
    ) {
      this.drawPoint()
    }
  }

  componentDidMount() {
    this.initPosition().then(cityPoint => {
      this.drawMap(cityPoint)
    })
  }

  componentWillUnmount() {
  }

  render() {
    const {style} = this.props

    return (
      <div
        className={styles['power-station-map']}
        style={style}
        id="mapContainer"
      >
        <CommonStationTree
          toggleAble
          disableFirstChildSelect
          className={styles['tree-container']}
          onChildrenClick={this.treeNodeClick}
        />
        <FullScreenBtn
          targetId="mapContainer"
          className={styles['fullscreen-btn']}
        />
        <div className={styles['map-container']} ref={this.chartRef}></div>
      </div>
    )
  }
}

const mapStateToProps = (model, {}, state) => {
  const {pointList} = state.stationTree

  const {realStationMap} = model
  let results = {
    pointList,
    realStationMap
  }
  return results
}

export default makeConnect(storage_station_monitor, mapStateToProps)(PowerStationMap)
