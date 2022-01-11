import React, { useEffect } from "react";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { makeConnect } from "../../umi.helper";
import Page from "../../../components/Page";
import { Button, Modal } from "wanke-gui";
import Tools from "../../../components/layout/Tools";
import Back1 from "../../../components/layout/Back1";
import CollectingDeviceList, {
  OPERATION_STATUS,
  operationStatusMap
} from "../components/collectingDeviceList";
import { CollectingDeviceModal } from "../models/collectingDevice";
import { iot_collecting_device } from "../../constants";
import styles from "./index.less";
import DeviceConfirmModal from "../components/deviceConfirmModal";
import moment from "moment";
import { ExclamationCircleOutlined } from "wanke-icon";
import utils from '../../../public/js/utils'

interface Props
  extends PageProps,
  CollectingDeviceModal,
  MakeConnectProps<CollectingDeviceModal> {
  loading?: boolean;
  exportLoading?: boolean;
  controllerId?: string;
  controllerName?: string;
  projectName?: string;
}

const CollectingDevice: React.FC<Props> = props => {
  const {
    pageId,
    exportLoading,
    totalCount,
    list,
    query,
    loading,
    isDeviceConfirmModal,
    controllerName,
    projectName,
    controllerId,
    confirmType,
    confirmRecord,
    confirmData
  } = props;

  const fetchData = () => {
    props.action("getChangeEnum");
    props.action("getTableData", { controllerId });
  };

  const handlePageChange = (page, size) => {
    props.updateQuery({ page, size });
    fetchData();
  };

  const handleViewHistory = () => {
    props.forward("ChangeHistory", { controllerId });
  };

  const showComfirmModal = (confirmData, record, val) => {
    props.updateState({
      isDeviceConfirmModal: true,
      confirmRecord: record,
      confirmType: val,
      confirmData
    });
  }

  const handleConfirm = (val: OPERATION_STATUS, record: any) => {
    switch (val) {
      case OPERATION_STATUS.new:
      case OPERATION_STATUS.removed:
      case OPERATION_STATUS.reset:
        // 操作与当前状态相同 不做任何处理
        if (record.controlReplace && val === record.controlReplace.name) break;
        Modal.confirm({
          title: val === OPERATION_STATUS.reset ?
            utils.intl('确认要重置更换确认') :
            utils.intl(`确认设置为{${utils.intl(operationStatusMap[val])}}`) + '?',
          okText: utils.intl('确认'),
          cancelText: utils.intl('取消'),
          icon: <ExclamationCircleOutlined />,
          onOk() {
            return props
              .dispatch<any>({
                type: `${iot_collecting_device}/confirmDevice`,
                payload: {
                  isNewOrRemoved: true,
                  deviceRecordId: record.id,
                  controllerId,
                  type: val
                }
              })
          },
          onCancel() { }
        });
        break;
      case OPERATION_STATUS.replace:
      case OPERATION_STATUS.replaced:
        let confirmData: any = {
          originalDeviceId: val === OPERATION_STATUS.replaced ? record.id : undefined,
          originalDeviceName: val === OPERATION_STATUS.replaced ? record.name : undefined,
          replaceDeviceId: val === OPERATION_STATUS.replace ? record.id : undefined,
          replaceDeviceName: val === OPERATION_STATUS.replace ? record.name : undefined,
          limitTime: record.stateTime,
          replaceTime: moment(record.stateTime),
        };
        if (record.controlReplace &&
          record.controlReplace.name &&
          record.controlReplace.name !== OPERATION_STATUS.new &&
          record.controlReplace.name !== OPERATION_STATUS.removed
        ) {
          // 编辑
          props.dispatch<any>({
            type: `${iot_collecting_device}/getChangeHistoryInfo`,
            payload: { id: record.id }
          }).then(res => {
            confirmData = {
              id: res.id,
              originalDeviceId: res.oldDeviceLog && res.oldDeviceLog.id,
              originalDeviceName: res.oldDeviceLog && res.oldDeviceLog.name,
              replaceDeviceId: res.newDeviceLog && res.newDeviceLog.id,
              replaceDeviceName: res.newDeviceLog && res.newDeviceLog.name,
              replaceTime: moment(res.replaceTime),
              measureFunc: res.oldPositive || res.oldPositive === 0 ? "1" : "2",
              originalForward: res.oldPositive,
              replaceForward: res.newPositive,
              originalReverse: res.oldNegative,
              replaceReverse: res.newNegative,
              limitTime: record.stateTime
            };
            showComfirmModal(confirmData, record, val);
          });
        } else {
          showComfirmModal(confirmData, record, val);
        }
        break;
      default:
        break;
    }
  };

  const handleDeviceConfirmOk = () => {
    fetchData();
  }

  const getDisableFormItemName = () => {
    // 编辑的时候不允许修改设备
    if (confirmData.id) return ['oldDeviceId', 'newDeviceId'];
    if (confirmType === OPERATION_STATUS.replaced) return ['oldDeviceId'];
    return ['newDeviceId'];
  }

  useEffect(() => {
    fetchData();
    return () => {
      props.action("reset");
    };
  }, []);

  return (
    <Page pageId={pageId} pageTitle={utils.intl('采集设备管理')} onActivity={fetchData}>
      <section className={styles["page-container"]}>
        <header className={styles["header"]}>
          <div className={styles["desc"]}>
            <p>
              <span className={styles["label"]}>{utils.intl('控制器名称')}:</span>
              <span className={styles["content"]}>{controllerName}</span>
            </p>
            <p>
              <span className={styles["label"]}>{utils.intl('所属工程')}:</span>
              <span className={styles["content"]}>{projectName}</span>
            </p>
          </div>
          <Button type="primary" onClick={handleViewHistory}>
            {utils.intl('设备更换记录')}
          </Button>
        </header>
        <footer className={styles["footer"]}>
          <CollectingDeviceList
            onConfirm={handleConfirm}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            total={totalCount}
            dataSource={list}
          />
        </footer>
        {isDeviceConfirmModal && (
          <DeviceConfirmModal
            disableFormItemName={getDisableFormItemName()}
            confirmRecord={confirmRecord}
            recordId={confirmData.id}
            controllerId={controllerId}
            initData={confirmData}
            confirmType={confirmType}
            prevConfirmType={confirmRecord.controlReplace && confirmRecord.controlReplace.name}
            visible={isDeviceConfirmModal}
            onOk={handleDeviceConfirmOk}
            closeModal={() => props.updateState({ isDeviceConfirmModal: false })}
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

export default makeConnect(
  iot_collecting_device,
  mapStateToProps
)(CollectingDevice);
