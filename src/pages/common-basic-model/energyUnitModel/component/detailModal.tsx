import React from 'react'
import { Col, Form, Modal, Row, Select } from 'wanke-gui'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import utils from '../../../../public/js/utils';
import { makeConnect } from '../../../umi.helper';
import { energyUnit } from '../models';
import './detail-modal.less'

const FormItem = Form.Item;

interface Props extends MakeConnectProps<energyUnit>, energyUnit {}

const DetailModal: React.FC<Props> = (props) => {
  const {
    dispatch,
    detailModal,
    record,
    regionsArr,
  } = props;

  const ok = () => {
    dispatch({
      type: 'energyUnitModel/updateState',
      payload: {
        detailModal: false,
      },
    });
  };

  const cancel = () => {
    dispatch({
      type: 'energyUnitModel/updateState',
      payload: {
        detailModal: false,
      },
    });
  };

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
      wrapClassName={'customerModal basic-model-detail-energy-dialog'}
    >
      <Form layout={isZh ? 'horizontal' : 'vertical'}>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem label={utils.intl('能量单元类型ID')}>{record.name}</FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={utils.intl('能量单元类型')}>{record.title}</FormItem>
          </Col>
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

export default makeConnect('energyUnitModel', mapStateToProps)(DetailModal)
