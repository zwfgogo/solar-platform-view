import React, { Component } from "react";
import { connect } from "dva";
import PowerStationMap from "./components/powerStationMap";
import { BoardType } from "./contant";
import PowerStationMatrix from "./components/powerStationMatrix";
import PowerStationTable from "./components/powerStationTable";
import Page from "../../../components/Page";
import styles from "./index.less";
import { WankeFourRectOutlined, WankeListSearchOutlined, WankeMapOutlined } from 'wanke-icon'
import BoardTypeMenu from "./components/BoardTypeMenu";
import { SearchInput } from "wanke-gui";
import utils from '../../../public/js/utils';

interface Props {
  queryStr: string;
  dispatch: any;
  boardType: BoardType;
  tableData: any;
  pageId?: any;
}

interface State {}

class PowerStationPv extends Component<Props, State> {
  changeBoardType = (type: BoardType) => {
    this.props.dispatch({
      type: "powerStationPv/updateToView",
      payload: { boardType: type, queryStr: "" }
    });
  };

  handleSearchChange = e => {
    this.props.dispatch({
      type: "powerStationPv/updateToView",
      payload: { queryStr: e.target.value || "" }
    });
  };

  handleSearch = (val: string) => {
    const { boardType, tableData } = this.props;
    switch (boardType) {
      case BoardType.Matrix:
        this.fetchData({ queryStr: val, type: "powerStationPv/getMatrixData" });
        break;
      case BoardType.Table:
        this.fetchData({
          queryStr: val,
          type: "powerStationPv/getTableData",
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
    this.props.dispatch({
      type: params.type,
      payload: {
        ...restParams
      }
    });
  };

  componentDidMount() {
    this.props.dispatch({ type: "powerStationPv/init", payload: { dispatch: this.props.dispatch } });
  }

  componentWillUnmount() {
    this.changeBoardType(BoardType.Map);
    this.props.dispatch({ type: "powerStationPv/closeSocket" });
  }

  render() {
    const { boardType } = this.props;
    return (
      <Page
        pageId={this.props.pageId}
        pageTitle={utils.intl("集中监控")}
        style={{ backgroundColor: "unset" }}
      >
        <div className={styles["page-container"]}>
          {boardType !== BoardType.Map && (
            <div className={styles["menu"]}>
              <SearchInput
                searchSize="normal"
                value={this.props.queryStr}
                placeholder={utils.intl("请输入查询的电站名称")}
                onChange={this.handleSearchChange}
                onSearch={this.handleSearch}
                style={{ width: 300 }}
              />
              {/* <BoardTypeMenu style={{ border: '1px solid #e2e2ea' }} /> */}
            </div>
          )}
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

const mapStateToProps = state => ({ ...state.powerStationPv });
export default connect(mapStateToProps)(PowerStationPv);
