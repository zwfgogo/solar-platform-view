import React from "react";
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import { FullLoading } from "wanke-gui";
import { vpp_bill } from "../../../constants";
import { makeConnect } from "../../../umi.helper";
import { VppBillModal, BOARD_TYPE } from "../../models/vppBill";
import MakeConnectProps from "../../../../interfaces/MakeConnectProps";
import moment from "moment";
import {
  useEchartsOption,
  CustomChartOption
} from "../../../../components/charts/common-echarts/useEchartsOption";

const colorList = ["#426afc", "#3cecd9"];

const grid = {
  left: "80",
  right: "30",
  top: "60",
  bottom: "30"
};

interface Props extends VppBillModal, MakeConnectProps<VppBillModal> {
  chartLoading?: boolean;
}

const ProfitChart: React.FC<Props> = props => {
  const { profitData = {}, boardType } = props;
  const { option } = useEchartsOption<CustomChartOption.LineChart>({
    colorList,
    showLegend: true,
    showUnit: true,
    isUnitPrev: true,
    data: profitData,
    customOption: {
      grid,
      xAxis: {
        axisLabel: {
          formatter: function(value) {
            const time = moment(value);
            return boardType === BOARD_TYPE.MONTH
              ? time.date()
              : time.month() + 1;
          }
        }
      }
    }
  });

  return (
    <>
      {props.chartLoading && <FullLoading />}
      <CommonEcharts option={option} />
    </>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    chartLoading: getLoading("getProfitChart")
  };
};

export default makeConnect(vpp_bill, mapStateToProps)(ProfitChart);
