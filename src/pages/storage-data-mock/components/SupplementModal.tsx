import moment, { Moment } from 'moment';
import React from 'react';
import { Form, Modal } from 'wanke-gui';
import { Props as ModalProps } from 'wanke-gui/lib/modal/WankeModal';
import { FormContainer } from '../../../components/input-item/InputItem';
import RangePicker from '../../../components/rangepicker';
import { disabledDateAfterYesterday } from '../../../util/dateUtil';
import utils from '../../../public/js/utils'

const FormItem = Form.Item;

export interface SuplementFormValues {
  date: Moment[];
}

interface Props extends ModalProps {
  closeModal: () => void;
  onSupplement: (values: SuplementFormValues) => Promise<any>;
}

const SupplementModal: React.FC<Props> = ({ closeModal, onSupplement, ...restProps }) => {
  const [form] = Form.useForm();
  
  const handleOk = () => {
    form.validateFields().then((values: SuplementFormValues) => {
      console.log(values);
      onSupplement(values)
        .then(() => {
          closeModal();
        })
    })
  }

  const handleCancel = () => {
    closeModal();
  }

  return (
    <Modal
      {...restProps}
      getContainer={false}
      title={utils.intl('数据补录')}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <FormContainer form={form} initialValues={{ date: [moment().subtract(1, 'day'), moment().subtract(1, 'day')] }}>
        <FormItem
          name="date"
          rules={[{ required: true, message: utils.intl('请选择时间') }]}
          label={utils.intl('日期')}
        >
          <RangePicker disabledDate={current => disabledDateAfterYesterday(current)} style={{ width: '100%' }} allowClear={false} />
        </FormItem>
      </FormContainer>
    </Modal>
  );
};

export default SupplementModal;