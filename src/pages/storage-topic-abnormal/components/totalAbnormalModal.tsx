import { ModalProps } from "antd/lib/modal";
import { connect } from "dva";
import moment, { Moment } from "moment";
import React from "react";
import { formatExportData } from "../../../components/CustomDownload";
import utils from "../../../public/js/utils";
import CommonAbnormalModal from "./commonAbnormalModal";

interface Props extends ModalProps {
  totalTableList?: any[];
  tableLoading?: boolean;
  mode?: string;
  dispatch?: any;
  stationId?: string;
}

const TotalAbnormalModal: React.FC<Props> = ({
  dispatch,
  visible,
  totalTableList,
  tableLoading,
  stationId,
  mode,
  ...restProps
}) => {
  const isDay = /day/.test(mode);
  const fetchData = (date: Moment[]) => {
    dispatch({
      type: "abnormal/getTotalAbnormalTable",
      payload: {
        stationId,
        startTime: date[0].format(isDay ? "YYYY-MM-DD" : "YYYY-MM"),
        endTime: date[1].format(isDay ? "YYYY-MM-DD" : "YYYY-MM")
      }
    });
  };

  const fetchExportData = () => {
    return { results: formatExportData(totalTableList, columns) };
  };

  const columns: any = [
    {
      title: utils.intl('时间'),
      dataIndex: "dtime",
      exportFormat: (text) => {
        return isDay ? text : moment(text).format('YYYY年MM月')
      }
    },
    {
      title: utils.intl('异常数量/个'),
      dataIndex: "val"
    }
  ];

  return (
    <CommonAbnormalModal
      {...restProps}
      mode={mode}
      visible={visible}
      fetchData={fetchData}
      fetchExportData={fetchExportData}
      columns={columns}
      dataSource={totalTableList}
      tableLoading={tableLoading}
      exportTableLoading={false}
    />
  );
};

const mapStateToProps = state => ({
  ...state.abnormal,
  stationId: state.global.selectedStationId,
  tableLoading: state.loading.effects["abnormal/getTotalAbnormalTable"]
});
export default connect(mapStateToProps)(TotalAbnormalModal);
