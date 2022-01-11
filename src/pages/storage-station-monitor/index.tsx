import React, { Component } from "react";
import PowerStationMap from "./components/powerStationMap";
import { BoardType } from "./contant";
import PowerStationMatrix from "./components/powerStationMatrix";
import PowerStationTable from "./components/powerStationTable";
import SearchInput from "../../components/SearchInput";
import Page from "../../components/Page";
import styles from "./index.less";
import { WankeFourRectOutlined, WankeListSearchOutlined, WankeMapOutlined } from 'wanke-icon'
import {storage_station_monitor} from '../constants'
import {makeConnect} from '../umi.helper'
import MakeConnectProps from '../../interfaces/MakeConnectProps'

const BoardTypeTab = ({ boardType, activeType, onClick, icon, label }) => {
  return (
    <a
      className={`${styles["tab-item"]} ${
        boardType === activeType ? styles["tab-item-active"] : ""
      }`}
      onClick={onClick}
    >
      {icon == 'wanke-map' && (<WankeMapOutlined style={{ fontSize: 18, marginRight: 10 }}/>)}
      {icon == 'wanke-four-rect' && (<WankeFourRectOutlined style={{ fontSize: 18, marginRight: 10 }}/>)}
      {icon == 'wanke-list-search' && (<WankeListSearchOutlined style={{ fontSize: 18, marginRight: 10 }}/>)}
      {label}
    </a>
  );
};

interface Props extends MakeConnectProps<any>{
  queryStr: string;
  dispatch: any;
  boardType: BoardType;
  tableData: any;
  pageId?: any;
}

interface State {}

class PowerStationPv extends Component<Props, State> {
  changeBoardType = (type: BoardType) => {
    this.props.action("updateToView", { boardType: type, queryStr: "" });
  };

  handleSearchChange = e => {
    this.props.action("updateToView", { queryStr: e.target.value || "" });
  };

  handleSearch = (val: string) => {
    const { boardType, tableData } = this.props;
    switch (boardType) {
      case BoardType.Matrix:
        this.fetchData({ queryStr: val, type: "getMatrixData" });
        break;
      case BoardType.Table:
        this.fetchData({
          queryStr: val,
          type: "getTableData",
          page: 1,
          size: tableData.size
        });
        break;
      default:
        break;
    }
  };

  fetchData = (params: {
    queryStr: string;
    type: string;
    page?: number;
    size?: number;
  }) => {
    const { type, ...restParams } = params;
    this.props.action(params.type, restParams);
  };

  componentDidMount() {
    this.props.action('init', { dispatch: this.props.dispatch });
  }

  componentWillUnmount() {
    this.changeBoardType(BoardType.Map);
  }

  render() {
    const { boardType } = this.props;

    return (
      <Page
        pageId={this.props.pageId}
        pageTitle="电站监测"
        style={{ backgroundColor: "unset" }}
      >
        <div className={styles["page-container"]}>
          <div className={styles["menu"]}>
            <div className={styles["tabs"]}>
              <BoardTypeTab
                boardType={boardType}
                activeType={BoardType.Map}
                onClick={() => this.changeBoardType(BoardType.Map)}
                icon="wanke-map"
                label="地图模式"
              />
              <BoardTypeTab
                boardType={boardType}
                activeType={BoardType.Matrix}
                onClick={() => this.changeBoardType(BoardType.Matrix)}
                icon="wanke-four-rect"
                label="矩阵模式"
              />
              <BoardTypeTab
                boardType={boardType}
                activeType={BoardType.Table}
                onClick={() => this.changeBoardType(BoardType.Table)}
                icon="wanke-list-search"
                label="表格模式"
              />
            </div>
            <div className={styles["filter-box"]}>
              {boardType !== BoardType.Map && (
                <SearchInput
                  value={this.props.queryStr}
                  placeholder="请输入查询的电站名称"
                  onChange={this.handleSearchChange}
                  onSearch={this.handleSearch}
                  style={{ width: 300 }}
                />
              )}
            </div>
          </div>
          <div className={styles["content"]}>
            <PowerStationMap
              style={boardType === BoardType.Map ? {} : { display: "none" }}
            />
            {boardType === BoardType.Matrix ? <PowerStationMatrix /> : ""}
            {boardType === BoardType.Table ? <PowerStationTable /> : ""}
          </div>
        </div>
      </Page>
    );
  }
}

const mapStateToProps = model => ({ ...model });
export default makeConnect(storage_station_monitor, mapStateToProps)(PowerStationPv);
