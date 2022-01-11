import React from 'react'
import { Col, Form, Modal, Row, Select } from 'wanke-gui'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import utils from '../../../../public/js/utils';
import { makeConnect } from '../../../umi.helper';
import { device } from '../models';
import './detail-modal.less'

const FormItem = Form.Item;

interface Props extends MakeConnectProps<device>, device {}

const DetailModal: React.FC<Props> = (props) => {
  const {
    dispatch,
    detailModal,
    record,
    modalTitle,
    arr,
    terminalNumber,
    regionsArr,
    devicePropertiesArr,
    yesOrNo,
    typeId,
    inputOutputTypesArr,
    deviceCategoriesArr,
    judgeinputOutput
  } = props;

  const ok = () => {
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        detailModal: false,
        arr: [1, 1]
      },
    });
  };

  const cancel = () => {
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        detailModal: false,
        arr: [1, 1]
      },
    });
  };

  let terminalRecord = {}
  record.terminals && record.terminals.forEach((item, index) => {
    terminalRecord[index] = { name: item.title, type: item.inputOutputType?.id }
  })

  let language = localStorage.getItem('language');
  const isZh = language === 'zh';

  const regionIds = record.regionIds ? record.regionIds.split('，').map(Number) : []

  return (
    <Modal
      centered
      maskClosable={false}
      width={640}
      visible={detailModal}
      title={utils.intl('详情')}
      footer={null}
      onOk={ok}
      onCancel={cancel}
      wrapClassName={'customerModal basic-model-detail-device-dialog'}
    >
      <Form layout={isZh ? 'horizontal' : 'vertical'}>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem label={utils.intl('设备性质')}>{record.deviceProperty?.title}</FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={utils.intl('设备大类')}>{record.deviceCategoryTitle}</FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={utils.intl('设备类型ID')}>{record.name}</FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={utils.intl('设备类型')}>{record.title}</FormItem>
          </Col>
          <Col span={12}>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.devicePropertyId !== currentValues.devicePropertyId}
            >
              {({ getFieldValue }) => {
                return record.deviceProperty && record.deviceProperty.id === devicePropertiesArr[0].value ? (
                  <FormItem label={utils.intl('设备端子数量')}>
                    {record.terminalNum}
                  </FormItem>
                ) : null;
              }}
            </Form.Item>
          </Col>

          {record.deviceProperty && record.deviceProperty.id === devicePropertiesArr[0].value ? (
            <>
              <Col span={12}>
                <FormItem label={utils.intl('输入/输出等效')}>{record.inputOutputEqual ? utils.intl('是') : utils.intl('否')}</FormItem>
              </Col>
              <Col span={12}>
                <FormItem label={utils.intl('输入/输出可反')}>{record.inputOutputReverse ? utils.intl('是') : utils.intl('否')}</FormItem>
              </Col>
              {!record.inputOutputEqual ? (
                arr.map((o, i) => {
                  let item = terminalRecord[i] || {}
                  const typeName = item.type ? inputOutputTypesArr.find(target => target.value === item.type)?.name : ''
                  return (
                    <Col span={12}>
                      <FormItem label={utils.intl('N号端子名称', i + 1)}>{item.name || ''}-{typeName || ''}</FormItem>
                    </Col>
                  )
                })
              ) : null}
            </>
          ) : null}
          <Col span={24}>
            <FormItem label={utils.intl('地区标识')}>{regionsArr.filter(item => regionIds.includes(item.value)).map(item => item.name).join(',')}</FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
  };
}

export default makeConnect('deviceModel', mapStateToProps)(DetailModal)
