import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Modal, Select } from 'wanke-gui';
import DatePicker from '../../../components/date-picker'
import { FormContainer } from '../../../components/input-item/InputItem';
import RangePicker from '../../../components/rangepicker';
import { disabledDateAfterToday } from '../../../util/dateUtil';
import utils from '../../../public/js/utils';

const FormItem = Form.Item;

import locale from 'antd/lib/date-picker/locale/zh_CN'

export interface ExportFormValues {
  stationId: string;
  date: Moment;
}

interface Props {
  onExport: (values: ExportFormValues) => Promise<any>;
  stationList: any[];
  stationId?: string;
  loading?: boolean;
}

const ExportBtn: React.FC<Props> = ({ onExport, stationList, stationId, loading }) => {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false);

  const handleOk = () => {
    form.validateFields().then((values: ExportFormValues) => {
      console.log(values);
      onExport(values)
        .then(() => {
          setVisible(false);
        })
    })
  };

  useEffect(() => {
    form.resetFields();
  }, [visible]);

  return (
    <>
      <Button
        type="primary"
        style={{ marginRight: 8 }}
        onClick={() => setVisible(true)}
      >
        {utils.intl('导出')}
      </Button>
      <Modal
        title={utils.intl('导出模板')}
        width={600}
        visible={visible}
        destroyOnClose={false}
        confirmLoading={loading}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
      >
        <FormContainer form={form} initialValues={{ stationId: stationId === 'all' ? undefined : stationId, date: [moment(), moment()] }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="stationId"
                rules={[{ required: true, message: utils.intl('请选择电站') }]}
                label={utils.intl('请选择电站')}
              >
                <Select dataSource={stationList} placeholder={utils.intl('请选择电站')} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="date"
                rules={[{ required: true, message: utils.intl('请选择时间') }]}
                label={utils.intl('日期')}
              >
                <RangePicker disabledDate={current => disabledDateAfterToday(current)} style={{ width: '100%' }} allowClear={false} />
              </FormItem>
            </Col>
          </Row>
        </FormContainer>
      </Modal>
    </>
  );
};

export default ExportBtn;