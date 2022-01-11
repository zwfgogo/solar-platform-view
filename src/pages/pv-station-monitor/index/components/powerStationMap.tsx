import React, { Component } from "react";
import { connect } from "dva";
import { message } from "wanke-gui";
import FullScreenBtn from "../../../../components/FullScreenBtn";
import styles from "./styles/powerStationMap.less";
import BmapContent from "./BmapContent";
import GoogleMapContent from "./GoogleMapContent";
import classnames from "classnames";
import BoardTypeMenu from "./BoardTypeMenu";
import StationList from "./StationList";
import MapInfoAside from "./MapInfoAside";
import { chartSeries } from "../model";
import Util from '../../../../public/js/utils';
import StatinIconPng from "../../../../static/img/map-station-icon.png"
import { isMicrogrid, isStorageSystem } from "../../../../core/env";
import MicrogridMapInfoAside from "./MicrogridMapInfoAside";
import StorageMapInfoAside from "./StorageMapInfoAside";
import { triggerEvent } from "../../../../util/utils";

export function hasPos(point) {
  return point && point.coordinate &&
    (point.coordinate[0] || point.coordinate[0] === 0) &&
    (point.coordinate[1] || point.coordinate[1] === 0);
}

enum MapType {
  Google,
  Bmap
}

export interface Point {
  id: number;
  longitude: number;
  latitude: number;
  coordinate: number[];
}

interface Props {
  dispatch: any;
  style?: React.CSSProperties;
  mapStationList?: any[];
  mapStationLoading?: boolean;
  realStationMap?: any;
  chartData?: any;
  microgridChartData?: any
  socketLoading?: any
  storageChartData?: any
}

interface State {
  activeNode: Point
  mapType: MapType
  showGoogle: boolean
}

class PowerStationMap extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      activeNode: null,
      mapType: googleMapAble ? MapType.Google : MapType.Bmap,
      showGoogle: googleMapAble ? true : false
    }
  }

  treeNodeClick = (node) => {
    if (hasPos(node)) {
      this.emitMessage(node);
      this.setState({ activeNode: node });
    } else {
      message.error("无位置信息");
      return false;
    }
  };

  emitMessage = (node) => {
    if(!node?.id && node?.id !== 0) {
      this.props.dispatch({ type: "powerStationPv/updateToView", payload: {
        chartData: { series: chartSeries() }
      }});
      return;
    }
    if(node?.id !== this.state.activeNode?.id) {
      this.props.dispatch({ type: "powerStationPv/updateToView", payload: {
        chartData: { series: chartSeries() },
        microgridChartData: {},
        storageChartData: {},
      }});
      this.props.dispatch({ type: "powerStationPv/emitSocket", payload: {
        eventName: 'real',
        params: { stationIds: `${node.id}` } 
      }});
      this.props.dispatch({ type: "powerStationPv/emitSocket", payload: {
        eventName: isMicrogrid() ? 'microgridCurve' : (isStorageSystem() ? 'storageCurve' : 'curve'),
        params: { stationId: node.id, frequency:'original' } 
      }});
    }
  }

  // 用于树展示选中点
  setActiveMapPoint = (activeKey, node) => {
    this.emitMessage(node);
    this.setState({ activeNode: node });
  };

  handleChangeMapType = (mapType: MapType) => {
    this.setState({ mapType, activeNode: null });
    this.props.dispatch({
      type: "stationTree/updateToView",
      payload: { activeKey: null }
    });
  }

  fetchStationList = (val: string = "") => {
    this.props.dispatch({
      type: "powerStationPv/getMapStationList",
      payload: { queryStr: val }
    }).then((mapStationList) => {
      const { activeNode } = this.state;
      const node = mapStationList.find(hasPos)
      if (node && !activeNode) {
        this.treeNodeClick(node)
      }
    });
  }

  componentDidMount() {
    this.fetchStationList();
    googlePromise.then(() => {
      this.setState({ showGoogle: true })
    });
  }

  render() {
    const { activeNode, mapType } = this.state;
    const { style, mapStationList, mapStationLoading, realStationMap = {}, chartData, microgridChartData, storageChartData, socketLoading } = this.props;

    const renderAside = () => {
      if (isMicrogrid()) {
        return (
          <MicrogridMapInfoAside
            node={activeNode}
            chartLoading={socketLoading['microgridCurve']}
            realData={realStationMap[activeNode.id]}
            chartData={microgridChartData}
          />
        )
      }
      if (isStorageSystem()) {
        return (
          <StorageMapInfoAside
            node={activeNode}
            chartLoading={socketLoading['storageCurve']}
            realData={realStationMap[activeNode.id]}
            chartData={storageChartData}
          />
        )
      }

      return (
        <MapInfoAside
          node={activeNode}
          chartLoading={socketLoading['curve']}
          realData={realStationMap[activeNode.id]}
          chartData={chartData}
        />
      )
    }

    return (
      <div
        className={styles["power-station-map"]}
        style={style}
        id="mapContainer"
      >
        <StationList
          activeNode={activeNode}
          onClick={this.treeNodeClick}
          className={styles["list-container"]}
          fetchData={this.fetchStationList}
          list={mapStationList}
          loading={mapStationLoading}
          icon={<img src={StatinIconPng} />}
        />
        <div className={styles["map-board-menu"]} style={{ right: activeNode ? 472 : 16 }}>
          {/* <BoardTypeMenu /> */}
          <FullScreenBtn
            targetId="mapContainer"
            className={styles["fullscreen-btn"]}
          />
        </div>
        {
          activeNode && (
            <div className={styles["map-info"]}>
              {renderAside()}
            </div>
          )
        }
        {/* 暂时注释 暂时不做google地图 */}
        {this.state.showGoogle && (
          <div className={styles["map-change-menu"]}>
            <span
              className={classnames(styles["tab"], { [styles["active"]]: mapType === MapType.Bmap })}
              onClick={() => this.handleChangeMapType(MapType.Bmap)}
            >Baidu</span>
            <span
              className={classnames(styles["tab"], { [styles["active"]]: mapType === MapType.Google })}
              onClick={() => this.handleChangeMapType(MapType.Google)}
            >Google</span>
          </div>
        )}
        <BmapContent
          pointList={mapStationList}
          activeNode={activeNode}
          setActiveMapPoint={this.setActiveMapPoint}
          visible={mapType === MapType.Bmap}
        />
        {/* 暂时注释 暂时不做google地图 */}
        {this.state.showGoogle && (
          <GoogleMapContent
            pointList={mapStationList}
            activeNode={activeNode}
            setActiveMapPoint={this.setActiveMapPoint}
            visible={mapType === MapType.Google}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { mapStationList, realStationMap, chartData, microgridChartData, socketLoading, storageChartData } = state.powerStationPv;

  let results = {
    mapStationList,
    realStationMap,
    chartData,
    microgridChartData,
    storageChartData,
    socketLoading,
    mapStationLoading: state.loading.effects["powerStationPv/getMapStationList"]
  };
  return results;
};

export default connect(mapStateToProps)(PowerStationMap);
