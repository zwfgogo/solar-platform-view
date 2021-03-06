import React, { useEffect, useState } from "react";
import { InputNumber } from 'antd';
import { Row, Col, Select, Modal } from "wanke-gui";
import { iot_collecting_device } from "../../constants";
import { makeConnect } from "../../umi.helper";
import { CollectingDeviceModal } from "../models/collectingDevice";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { FormComponentProps } from '../../../interfaces/CommonInterface'
import InputItem, {
  FormContainer
} from "../../../components/input-item/InputItem";
import moment from "moment";
import { FullLoading } from "wanke-gui";
import styles from "./styles/deviceConfirmModal.less";
import DateTimePicker, { LIMIT_TYPE } from "../../../components/input-item/DateTimePicker";
import utils from '../../../public/js/utils'

type ConfirmProps = Pick<
  CollectingDeviceModal,
  "originalDeviceList" | "replaceDeviceList"
>;

interface Props
  extends FormComponentProps,
    ConfirmProps,
    MakeConnectProps<ConfirmProps> {
  visible: boolean;
  closeModal: () => void;
  initData?: any;
  confirmType?: string;
  onOk?: () => void;
  title?: string;
  loading?: boolean;
  initLoading?: boolean;
  recordId?: number;
  controllerId?: number;
  prevConfirmType?: string;
  confirmRecord?: any;
  disableFormItemName?: string[];
}

const DeviceConfirmModal: React.FC<Props> = props => {
  const {
    visible,
    closeModal,
    originalDeviceList,
    replaceDeviceList,
    initData = {},
    confirmType,
    onOk,
    title,
    loading,
    initLoading,
    recordId,
    controllerId,
    prevConfirmType,
    confirmRecord,
    disableFormItemName = []
  } = props;
  const [showReadings, setShowReadings] = useState(initData.measureFunc === "1");

  const handleOk = () => {
    props.form.validateFields().then((values) => {
        props
          .dispatch<any>({
            type: `${iot_collecting_device}/confirmDevice`,
            payload: {
              data: values,
              recordId,
              controllerId,
              type: confirmType,
              prevConfirmType,
              deviceRecordId: confirmRecord && confirmRecord.id
            }
          })
          .then(() => {
            onOk && onOk();
            closeModal();
          });
    });
  };

  const handleCancel = () => {
    closeModal();
  };

  useEffect(() => {
    props.action("getDeviceList", { controllerId });
  }, []);

  const disabledDate = current => {
    if (!initData.limitTime) return false;
    return current > moment(initData.limitTime).endOf('day');
  };

  const oldDeviceList = originalDeviceList.slice();
  const newDeviceList = replaceDeviceList.slice();
  if(initData.originalDeviceId && oldDeviceList.every(item => item.value !== initData.originalDeviceId)) {
    oldDeviceList.push({ name: initData.originalDeviceName, value: initData.originalDeviceId });
  }
  if(initData.replaceDeviceId && newDeviceList.every(item => item.value !== initData.replaceDeviceId)) {
    newDeviceList.push({ name: initData.replaceDeviceName, value: initData.replaceDeviceId });
  }
  const isOldDevicedDisabled = disableFormItemName.indexOf('oldDeviceId') > -1;
  const isNewDevicedDisabled = disableFormItemName.indexOf('newDeviceId') > -1;

  return (
    <Modal
      width={700}
      title={title}
      visible={visible}
      confirmLoading={loading}
      maskClosable={false}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <FormContainer
        form={props.form}
        className={styles["page-container"]}
        initialValues={{
          oldDeviceId: initData.originalDeviceId,
          newDeviceId: initData.replaceDeviceId,
          replaceTime: initData.replaceTime,
          measureFunc: initData.measureFunc || "2",
          oldPositive: initData.originalForward,
          newPositive: initData.replaceForward,
          oldNegative: initData.originalReverse,
          newNegative: initData.replaceReverse
        }}
      >
        {initLoading ? <FullLoading /> : ""}
        <Row>
          <Col span={12}>
            <InputItem
              name="oldDeviceId"
              label={utils.intl('??????????????????')}
              rules={[{ required: true, message: utils.intl('???????????????????????????') }]}
            >
              <Select
                placeholder={utils.intl('???????????????????????????')}
                dataSource={oldDeviceList}
                disabled={isOldDevicedDisabled}
              />
            </InputItem>
          </Col>
          <Col span={12}>
            <InputItem
              name="newDeviceId"
              label={
                <>
                  <span style={{ color: "#3a75f8" }}>{utils.intl('????????????')}</span>{utils.intl('??????')}
                </>
              }
              rules={[{ required: true, message: utils.intl('???????????????????????????') }]}
            >
              <Select
                placeholder={utils.intl('???????????????????????????')}
                dataSource={newDeviceList}
                disabled={isNewDevicedDisabled}
              />
            </InputItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <InputItem
              name="replaceTime"
              label={utils.intl('??????????????????')}
              rules={[{ required: true, message: utils.intl('???????????????????????????') }]}
            >
              <DateTimePicker
                limitTime={initData.limitTime}
                limitType={LIMIT_TYPE.after}
                disabledDate={disabledDate}
                placeholder={utils.intl('???????????????????????????')}
                style={{ width: "100%" }}
              />
            </InputItem>
          </Col>
          <Col span={12}>
            <InputItem
              name="measureFunc"
              label={utils.intl('??????????????????')}
              rules={[{ required: true, message: utils.intl('???????????????????????????') }]}
            >
              <Select
                onSelect={val => setShowReadings(val === "1")}
                placeholder={utils.intl('???????????????????????????')}
                dataSource={[
                  { name: utils.intl('???'), value: "1" },
                  { name: utils.intl('???2'), value: "2" }
                ]}
              />
            </InputItem>
          </Col>
        </Row>
        {showReadings ? (
          <>
            <Row>
              <Col span={12}>
                <InputItem
                  name="oldPositive"
                  label={utils.intl('????????????????????????????????????')}
                  rules={[
                    {
                      required: true,
                      message: utils.intl('?????????????????????????????????????????????')
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={9999999999999}
                    style={{ width: '100%' }}
                    placeholder={utils.intl('?????????????????????????????????????????????')}
                    precision={0}
                  />
                </InputItem>
              </Col>
              <Col span={12}>
                <InputItem
                  name="newPositive"
                  label={
                    <>
                      <span style={{ color: "#3a75f8" }}>{utils.intl('????????????')}</span>
                      {utils.intl('????????????????????????')}
                    </>
                  }
                  rules={[
                    {
                      required: true,
                      message: utils.intl('?????????????????????????????????????????????')
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={9999999999999}
                    style={{ width: '100%' }}
                    placeholder={utils.intl('?????????????????????????????????????????????')}
                    precision={0}
                  />
                </InputItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <InputItem
                  name="oldNegative"
                  label={utils.intl('????????????????????????????????????')}
                  rules={[
                    {
                      required: true,
                      message: utils.intl('?????????????????????????????????????????????')
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={9999999999999}
                    style={{ width: '100%' }}
                    placeholder={utils.intl('?????????????????????????????????????????????')}
                    precision={0}
                  />
                </InputItem>
              </Col>
              <Col span={12}>
                <InputItem
                  name="newNegative"
                  label={
                    <>
                      <span style={{ color: "#3a75f8" }}>{utils.intl('????????????')}</span>
                      {utils.intl('????????????????????????')}
                    </>
                  }
                  rules={[
                    {
                      required: true,
                      message: utils.intl('?????????????????????????????????????????????')
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={9999999999999}
                    style={{ width: '100%' }}
                    placeholder={utils.intl('?????????????????????????????????????????????')}
                    precision={0}
                  />
                </InputItem>
              </Col>
            </Row>
          </>
        ) : (
          ""
        )}
      </FormContainer>
    </Modal>
  );
};

DeviceConfirmModal.defaultProps = {
  title: utils.intl('????????????')
};

const _DeviceConfirmModal = FormContainer.create<Props>()(DeviceConfirmModal);

const mapStateToProps = (model, getLoading, state) => {
  return {
    originalDeviceList: model.originalDeviceList,
    replaceDeviceList: model.replaceDeviceList,
    initLoading: getLoading("getChangeHistoryInfo"),
    loading: getLoading("confirmDevice")
  };
};

export default makeConnect(
  iot_collecting_device,
  mapStateToProps
)(_DeviceConfirmModal);
