import React, { useEffect } from "react";
import Page from "../../../components/Page";
import PageProps from "../../../interfaces/PageProps";
import styles from "./index.less";
import { makeConnect } from "../../umi.helper";
import { iot_change_history } from "../../constants";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import Tools from "../../../components/layout/Tools";
import Back1 from "../../../components/layout/Back1";
import { ChangeHistoryModal } from "../models/changeHistory";
import ChangeHistoryList from "../components/changeHistoryList";
import DeviceConfirmModal from "../components/deviceConfirmModal";
import moment from "moment";

// 获取设备更换时间限制时间点
const getLimitTime = (record) => {
  const { oldDeviceLog = {}, newDeviceLog = {} } = record || {};
  const { stateTime: oldStateTime } = oldDeviceLog;
  const { stateTime: newStateTime } = newDeviceLog;
  if(!oldStateTime && !newStateTime) return undefined;
  if(!oldStateTime) return newStateTime;
  if(!newStateTime) return oldStateTime;
  return oldStateTime > newStateTime ? oldStateTime : newStateTime;
} 

interface Props
  extends PageProps,
    ChangeHistoryModal,
    MakeConnectProps<ChangeHistoryModal> {
  loading?: boolean;
  exportLoading?: boolean;
  controllerId?: number;
}

const ChangeHistory: React.FC<Props> = props => {
  const {
    pageId,
    loading,
    query,
    totalCount,
    list,
    exportLoading,
    editModal,
    editRecord,
    controllerId
  } = props;

  const fetchData = () => {
    props.action("getTableData", { controllerId });
  };

  const handlePageChange = (page, size) => {
    props.updateQuery({ page, size });
    fetchData();
  };

  const handleEdit = record => {
    props.updateState({
      editModal: true,
      editRecord: record
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
      props.action("reset");
    };
  }, []);

  return (
    <Page pageId={pageId} pageTitle="设备更换记录" onActivity={fetchData}>
      <section className={styles["page-container"]}>
        <footer className={styles["footer"]}>
          <ChangeHistoryList
            onEdit={handleEdit}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            total={totalCount}
            dataSource={list}
          />
        </footer>
        {editModal && (
          <DeviceConfirmModal
            disableFormItemName={['oldDeviceId', 'newDeviceId']}
            recordId={editRecord.id}
            initData={{
              originalDeviceId: editRecord.oldDevice && editRecord.oldDevice.id,
              originalDeviceName: editRecord.oldDevice && editRecord.oldDevice.title,
              replaceDeviceId: editRecord.newDevice && editRecord.newDevice.id,
              replaceDeviceName: editRecord.newDevice && editRecord.newDevice.title,
              replaceTime: moment(editRecord.replaceTime),
              measureFunc: editRecord.oldPositive || editRecord.oldPositive === 0 ? "1" : "2",
              originalForward: editRecord.oldPositive,
              replaceForward: editRecord.newPositive,
              originalReverse: editRecord.oldNegative,
              replaceReverse: editRecord.newNegative,
              limitTime: getLimitTime(editRecord)
            }}
            controllerId={controllerId}
            visible={editModal}
            onOk={() => {
              fetchData();
            }}
            closeModal={() => props.updateState({ editModal: false })}
          />
        )}
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loading: getLoading("getTableData"),
    exportLoading: getLoading("onExport")
  };
};

export default makeConnect(iot_change_history, mapStateToProps)(ChangeHistory);
