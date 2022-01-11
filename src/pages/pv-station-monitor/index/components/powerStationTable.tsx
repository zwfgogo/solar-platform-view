import React, { useEffect } from "react";
import {Pagination, Input, Table1, FullLoading, Table2} from 'wanke-gui'
import { history } from "umi";
import { connect } from "dva";
import classnames from "classnames";
import { useTable } from "../../../../components/useTable";
import CustomDownload, {
  formatExportData
} from "../../../../components/CustomDownload";
import styles from "./styles/powerStationTable.less";
import { jumpToTerminalSystem } from "../contant";
import AbsoluteBubble from "../../../../components/AbsoluteBubble";
import { globalNS } from "../../../constants";
import Util from '../../../../public/js/utils';

const heartBeatMap = {
  '0': Util.intl('全部通讯中断'),
  '1': Util.intl('全部通信正常'),
  '2': Util.intl('部分通讯中断'),
}

const heartBeatColorMap = {
  '0': '#fc5a5a',
  '1': 'rgba(0, 0, 0, 0.65);',
  '2': '#ff974a',
}

export function formatEmptyValue(value: any, defaultStr: string = "") {
  if (value === null || value === undefined || value === "") return defaultStr;
  return value;
}

export function addSpaceWidthUnit(value: any) {
  if (value === null || value === undefined || value === "" || value === "-") return value;
  return value.replace(/([^0-9\.]+)/g, '$1');
}

export function getStationStatus(code: number | string = "") {
  if(code === null) code = "";
  switch (code.toString()) {
    case "1":
      return "color-green";
    case "2":
      return "color-grey";
    case "3":
      return "color-orange";
    case "4":
      return "color-blue";
    case "5":
      return "color-red";
    default:
      return "";
  }
}

export function getRunningStatus(
  workStatus: string = "",
  offLine?: boolean,
  isExport?: boolean
) {
  if (!workStatus) return "-";
  const extraStr = offLine ? "(离线)" : "";
  return isExport ? (
    `${workStatus}${extraStr}`
  ) : (
    <span>
      {workStatus}
      <span style={{ color: "#e70d0d" }}>{extraStr}</span>
    </span>
  );
}

interface Props {
  dispatch?: any;
  size?: number;
  page?: number;
  queryStr?: string;
  totalCount?: number;
  list?: Array<any>;
  tableLoading?: boolean;
  exportTableLoading?: boolean;
  realStationMap?: any;
}

const PowerStationTable: React.FC<Props> = props => {
  const {
    tableLoading,
    exportTableLoading,
    page,
    size,
    queryStr,
    totalCount,
    dispatch,
    list,
    realStationMap
  } = props;

  useEffect(() => {
    fetchData({ page, size, queryStr });
  }, []);

  const fetchData = (params: {
    page: number;
    size: number;
    queryStr: string;
  }) => {
    dispatch({
      type: "powerStationPv/getTableData",
      payload: {
        page: params.page,
        size: params.size,
        queryStr: params.queryStr
      }
    });
  };

  const showTotal = (total: number) => {
    return <span className={styles["total-account"]}>{Util.intl("共")} {total} {Util.intl("条")}</span>;
  };

  const jumpToDetail = (url: string, data) => {
    dispatch({
      type: `${globalNS}/updateToView`,
      payload: {
        stationDetail: data,
        activeNode: data
      }
    })
    history.push(url)
  }

  const handleTitleClick = (record) => {
    jumpToDetail('/station-monitor/station_monitor', record)
  }

  const { changePage, changeSize } = useTable({
    page,
    size,
    queryStr,
    fetchData,
    dataSource: list
  });

  const columns: any = [
    {
      title: Util.intl('电站名称'),
      dataIndex: "title",
      width: 250,
      render: (text, record) => <AbsoluteBubble><a onClick={() => handleTitleClick(record)}>{text}</a></AbsoluteBubble>
    },
    {
      title: Util.intl('地址'),
      width: 250,
      dataIndex: "address",
      render: (text) => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: Util.intl('建设规模'),
      align: 'right',
      width: 150,
      dataIndex: "buildingScale",
      render: (text, record) => (
        <AbsoluteBubble>
          <span>
            <span style={{ color: "#009297" }}>
              {formatEmptyValue(record.ratedPowerDisplay)}
            </span>
            /
            <span style={{ color: "#3d7eff" }}>
              {formatEmptyValue(record.scaleDisplay)}
            </span>
          </span>
        </AbsoluteBubble>
      )
    },
    {
      title: Util.intl('今日累计辐照'),
      width: 130,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['irradiance'], "-")}</span>
    },
    {
      title: Util.intl('实时发电功率'),
      width: 130,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['activePower'], "-")}</span>
    },
    {
      title: Util.intl('今日发电量'),
      width: 130,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['generation'], "-")}</span>
    },
    {
      title: Util.intl('今日收益'),
      width: 130,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['revenue'], "-")}</span>
    },
    {
      title: Util.intl('今日满发时长'),
      width: 130,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['yield'], "-")}</span>
    },
    {
      title: Util.intl('今日PR'),
      width: 90,
      align: 'right',
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['pr'], "-")}</span>
    },
    {
      title: Util.intl('告警'),
      align: 'center',
      width: 70,
      dataIndex: "_discharge",
      render: (text, record) => <span>{formatEmptyValue(realStationMap?.[record.id]?.['alarmLevel'], "-")}</span>
    },
    {
      title: Util.intl('通信'),
      align: 'center',
      width: 120,
      dataIndex: "_discharge",
      render: (text, record) => {
        const heartBeatCode = realStationMap?.[record.id]?.['heartBeat'];
        return (
          <span
            style={heartBeatCode ? { color: heartBeatColorMap[heartBeatCode] } : {}}
          >{formatEmptyValue(heartBeatMap[heartBeatCode], "-")}</span>)
      }
    }
  ];

  return (
    <div className={styles["page-container"]}>
      <div className={styles["table-container"]}>
        {tableLoading && <FullLoading />}
        <Table2
          total={totalCount}
          x={1590}
          columns={columns}
          dataSource={list}
          page={page}
          size={size}
          onPageChange={changePage}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  const { tableData, queryStr, realStationMap } = state.powerStationPv;

  let results = {
    ...tableData,
    queryStr,
    realStationMap,
    tableLoading: state.loading.effects["powerStationPv/getTableData"],
    exportTableLoading: state.loading.effects["powerStationPv/exportTableData"]
  };
  return results;
};

export default connect(mapStateToProps)(PowerStationTable);
