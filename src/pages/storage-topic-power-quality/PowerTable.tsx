import React, { useEffect } from "react";
import { connect } from "dva";
import CustomDownload, {
  formatExportData
} from "../../components/CustomDownload";
import Forward from "../../public/components/Forward";
import styles from "./PowerTable.less";
import moment from "moment";
import { DetailPageType } from "./constant";
import { Table1 } from 'wanke-gui'
import { CrumbsPortal } from "../../frameset/Crumbs";
import utils from "../../public/js/utils";

interface Props {
  list?: Array<any>;
  tableLoading?: boolean;
  rangeValue: moment.Moment[];
}

const PowerTable: React.FC<Props> = ({
  tableLoading,
  list = [],
  rangeValue
}) => {
  const getEnergyList = (isAll?: boolean) => {
    let arr = list
      .filter(item => !!item.energyUnitId)
      .map(item => ({
        name: item.energyUnit,
        value: item.energyUnitId
      }));
    if (isAll) {
      arr.unshift({
        name: utils.intl('合计'),
        value: "all"
      });
    }
    return arr;
  };

  const getJumpConfig = (record, type) => {
    return {
      type,
      energyUnitCode: record.energyUnitId || "all",
      energyList: getEnergyList(type !== DetailPageType.ENERGYUIT),
      defaultStartTime: rangeValue[0],
      defaultEndTime: rangeValue[1]
    };
  };

  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: "key",
      width: 65,
    },
    {
      title: utils.intl('储能单元'),
      dataIndex: "energyUnit",
      render: (text, record) => {
        if (!record.energyUnitId) return text;
        return (
          <Forward
            to="energyUnitDetail"
            data={getJumpConfig(record, DetailPageType.ENERGYUIT)}
          >
            {text}
          </Forward>
        );
      }
    },
    {
      title: utils.intl('电压谐波越限次数'),
      dataIndex: "voltageHarmonicOvershoot",
      render: (text, record) =>
        text === 0 ? (
          <span>{text}</span>
        ) : (
            <Forward
              to="powerQualityDetail"
              data={getJumpConfig(record, DetailPageType.VOLTAGEHARMONIC)}
            >
              {text}
            </Forward>
          )
    },
    {
      title: utils.intl('电流谐波越限次数'),
      dataIndex: "currentHarmonicOvershoot",
      render: (text, record) =>
        text === 0 ? (
          <span>{text}</span>
        ) : (
            <Forward
              to="powerQualityDetail"
              data={getJumpConfig(record, DetailPageType.CURRENTHARMONIC)}
            >
              {text}
            </Forward>
          )
    },
    {
      title: utils.intl('电压合格率'),
      dataIndex: "voltageOvershoot",
      render: (text, record) =>
        text === 0 ? (
          <span>{text}</span>
        ) : (
            <Forward
              to="powerQualityDetail"
              data={getJumpConfig(record, DetailPageType.VOLTAGE)}
            >
              {text}
            </Forward>
          )
    },
    {
      title: utils.intl('三相不平衡越限日'),
      dataIndex: "threePhaseUnbalanceOvershoot",
      render: (text, record) =>
        text === 0 ? (
          <span>{text}</span>
        ) : (
            <Forward
              to="powerQualityDetail"
              data={getJumpConfig(record, DetailPageType.THREEPHASEUNBALANCE)}
            >
              {text}
            </Forward>
          )
    }
  ];

  return (
    <>
      <div className={styles["table-container"]}>
        <Table1
          x={500}
          columns={columns}
          dataSource={list}
          loading={tableLoading}
        />
      </div>
      <CrumbsPortal pageName='powerQuality'>
        <CustomDownload
          dataSource={() => {
            return { results: formatExportData(list, columns) };
          }}
          className={styles["export-btn"]}
          columns={columns}
          loading={false}
        />
      </CrumbsPortal>
    </>
  );
};

export default PowerTable;
