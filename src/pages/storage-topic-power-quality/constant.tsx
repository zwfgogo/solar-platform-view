import moment from "moment";
import React from "react";

import { CheckOutlined } from "wanke-icon";

import { WankeClearOutlined } from "wanke-icon";
import utils from "../../public/js/utils";

export enum DetailPageType {
  ENERGYUIT = "energy",
  VOLTAGEHARMONIC = "voltageHarmonic",
  CURRENTHARMONIC = "currentHarmonic",
  VOLTAGE = "voltage",
  THREEPHASEUNBALANCE = "threePhaseUnbalance"
}

const EnergyColumn = [
  {
    title: utils.intl('序号'),
    dataIndex: "key",
    width: 65,
  },
  {
    title: utils.intl('日期'),
    width: 120,
    dataIndex: "dtime"
  },
  {
    title: utils.intl('电压谐波越限次数'),
    dataIndex: "voltageHarmonicOvershoot",
  },
  {
    title: utils.intl('电流谐波越限次数'),
    dataIndex: "currentHarmonicOvershoot",
  },
  {
    title: utils.intl('电压合格率'),
    dataIndex: "voltageOvershoot",
  },
  {
    title: utils.intl('三相不平衡累计越限日'),
    dataIndex: "threePhaseUnbalanceOvershoot",
    // exportFormat: (value, record) =>
    //   `${value === "否" ? "X" : value === "是" ? "√" : value}`,
    render: (value, record) => {
      return (
        <span>
          {value === "否" ? (
            <WankeClearOutlined style={{ fontSize: "12px" }} />
          ) : value === "是" ? (
            <CheckOutlined style={{ fontSize: "12px", color: "#ee0000" }} />
          ) : (
            value
          )}
        </span>
      );
    }
  }
];

const VoltageHarmonicColumn = [
  {
    title: utils.intl('序号'),
    dataIndex: "key",
    width: 65,
  },
  {
    title: utils.intl('储能单元'),
    dataIndex: "energyUnitTitle"
  },
  {
    title: utils.intl('发生时间'),
    dataIndex: "dtime"
  },
  {
    title: utils.intl('越限相序'),
    dataIndex: "sequence",
  },
  {
    title: "THDu",
    dataIndex: "val",
  },
  {
    title: utils.intl('标准限值'),
    dataIndex: "threshold",
  }
];

const CurrentHarmonicColumn = [
  {
    title: utils.intl('序号'),
    dataIndex: "key",
    width: 65,
  },
  {
    title: utils.intl('储能单元'),
    dataIndex: "energyUnitTitle"
  },
  {
    title: utils.intl('发生时间'),
    dataIndex: "dtime"
  },
  {
    title: utils.intl('越限相序'),
    dataIndex: "sequence"
  },
  {
    title: utils.intl('谐波次数'),
    dataIndex: "harmonicNum",
  },
  {
    title: utils.intl('谐波电流值') + "(A)",
    dataIndex: "val",
  },
  {
    title: utils.intl('标准限值') + "(A)",
    dataIndex: "threshold",
  }
];

const VoltageColumn = [
  {
    title: utils.intl('序号'),
    dataIndex: "key",
    width: 65,
  },
  {
    title: utils.intl('储能单元'),
    dataIndex: "energyUnitTitle"
  },
  {
    title: utils.intl('发生时间'),
    dataIndex: "dtime"
  },
  {
    title: utils.intl('越限相序'),
    dataIndex: "sequence"
  },
  {
    title: utils.intl('越限类型'),
    dataIndex: "overshootType"
  },
  {
    title: utils.intl('电压极值') + "(V)",
    dataIndex: "val",
  },
  {
    title: utils.intl('持续时间'),
    dataIndex: "continueTime",
  },
  {
    title: utils.intl('标准阈值') + "(V)",
    dataIndex: "threshold",
  }
];

const ThreePhaseUnbalanceColumn = [
  {
    title: utils.intl('序号'),
    dataIndex: "key",
    width: 65,
  },
  {
    title: utils.intl('储能单元'),
    dataIndex: "energyUnitTitle"
  },
  {
    title: utils.intl('日期'),
    dataIndex: "dtime",
    render: (text) => text ? moment(text).format('YYYY-MM-DD') : text
  },
  {
    title: utils.intl('电流不平衡越限累计时间'),
    dataIndex: "currentContinueTime",
  },
  {
    title: utils.intl('电压不平衡越限累计时间'),
    dataIndex: "voltageContinueTime",
  },
  {
    title: utils.intl('是否越限日'),
    dataIndex: "overshootDay",
    exportFormat: (value, record) => `${value === false ? utils.intl('否') : utils.intl('是')}`,
    render: (value, record) => {
      return (
        <span>
          {value === false ? (
            <WankeClearOutlined style={{ fontSize: "12px" }} />
          ) : (
            <CheckOutlined style={{ fontSize: "12px", color: "#ee0000" }} />
          )}
        </span>
      );
    }
  }
];

export const Columns = {
  [DetailPageType.ENERGYUIT]: EnergyColumn,
  [DetailPageType.VOLTAGEHARMONIC]: VoltageHarmonicColumn,
  [DetailPageType.CURRENTHARMONIC]: CurrentHarmonicColumn,
  [DetailPageType.VOLTAGE]: VoltageColumn,
  [DetailPageType.THREEPHASEUNBALANCE]: ThreePhaseUnbalanceColumn
};

export const PageTitle = {
  [DetailPageType.ENERGYUIT]: utils.intl('储能单元电能质量明细'),
  [DetailPageType.VOLTAGEHARMONIC]: utils.intl('电压谐波越限记录查询'),
  [DetailPageType.CURRENTHARMONIC]: utils.intl('电流谐波越限记录查询'),
  [DetailPageType.VOLTAGE]: utils.intl('电压越限记录查询'),
  [DetailPageType.THREEPHASEUNBALANCE]: utils.intl('三相不平衡越限记录查询')
};
