import { ModalProps } from "antd/lib/modal";
import { connect } from "dva";
import { Moment } from "moment";
import React from "react";
import { formatExportData } from "../../../components/CustomDownload";
import utils from "../../../public/js/utils";
import CommonAbnormalModal from "./commonAbnormalModal";

interface Props extends ModalProps {
  deviceTableList?: any[];
  tableLoading?: boolean;
  mode?: string;
  dispatch?: any;
  stationId?: string;
}

const DeviceAbnormalModal: React.FC<Props> = ({
  dispatch,
  visible,
  deviceTableList,
  tableLoading,
  stationId,
  ...restProps
}) => {
  const fetchData = (date: Moment[]) => {
    dispatch({
      type: "abnormal/getDeviceAbnormalTable",
      payload: {
        stationId,
        startTime: date[0].format("YYYY-MM-DD"),
        endTime: date[1].format("YYYY-MM-DD")
      }
    });
  };

  const fetchExportData = () => {
    return { results: formatExportData(deviceTableList, columns) };
  };

  const columns: any = [
    {
      title: utils.intl('设备名称'),
      dataIndex: "dtime"
    },
    {
      title: utils.intl('异常数量/个'),
      dataIndex: "val"
    }
  ];

  return (
    <CommonAbnormalModal
      {...restProps}
      visible={visible}
      fetchData={fetchData}
      fetchExportData={fetchExportData}
      columns={columns}
      dataSource={deviceTableList}
      tableLoading={tableLoading}
      exportTableLoading={false}
    />
  );
};

const mapStateToProps = state => ({
  ...state.abnormal,
  stationId: state.global.selectedStationId,
  tableLoading: state.loading.effects["abnormal/getDeviceAbnormalTable"]
});
export default connect(mapStateToProps)(DeviceAbnormalModal);
