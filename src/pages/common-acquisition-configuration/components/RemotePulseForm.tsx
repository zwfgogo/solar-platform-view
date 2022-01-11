/**
 * 换表form页面
 */
import React, { useEffect } from 'react'
import { Button, DatePicker, InputNumber } from 'wanke-gui';
import { Form } from 'antd';
import utils from '../../../public/js/utils';
import "./index.less"
import moment, { Moment } from 'moment';

const FormItem = Form.Item

interface RemotePulseFormProps {
  stopValue?:number; // 自动获取原点号结束示值
  startValue?:number; // 自动获取新点号起始示值
  loading: boolean;
  handleStopTimeChange: (date: Moment) => void;
  handleStartTimeChange: (date: Moment) => void;
  initForm: (form: any) => void;
  onCancel: () => void;
  onOk: (form: any) => void;
}

// const formLayout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 16 },
// };

const RemotePulseForm: React.FC<RemotePulseFormProps> = (props) => {
  const { initForm, onCancel, onOk, handleStopTimeChange, handleStartTimeChange, stopValue, startValue } = props

  const [form] = Form.useForm();
  const language = localStorage.getItem('language') || 'zh';
  const formLayout = language === 'zh' ? {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  } : {
    labelCol: { span: 16 },
    wrapperCol: { span: 20 },
  };

  useEffect(() => {
    initForm && initForm(form);
  }, [])

  useEffect(() => {
    form.setFieldsValue({ stopValue: stopValue?.val });
  }, [stopValue])

  useEffect(() => {
    form.setFieldsValue({ startValue: startValue?.val });
  }, [startValue])

  return (
    <div className="form-box">
      <Form
        {...formLayout}
        layout={language === 'zh' ? 'horizontal' : 'vertical'}
        form={form}
      >
        <FormItem
          label={utils.intl('原点号停用时间')}
          name="stopTime"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请选择{0}', '原点号停用时间') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startTime = getFieldValue('startTime');
                if(startTime && startTime.format('YYYY-MM-DD HH:mm:ss') < value.format('YYYY-MM-DD HH:mm:ss')){
                  return Promise.reject(utils.intl('原点号停用时间不能大于新点号启用时间'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker showTime  disabledDate={(currentDate) => moment().isBefore(currentDate)} style={{ width: '100%' }} onChange={handleStopTimeChange} />
        </FormItem>
        <FormItem label={utils.intl('原点号结束示值')} name="stopValue">
          <InputNumber disabled style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          label={utils.intl('新点号启用时间')}
          name="startTime"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请选择{0}', '新点号启用时间') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const stopTime = getFieldValue('stopTime');
                if(stopTime && stopTime.format('YYYY-MM-DD HH:mm:ss') > value.format('YYYY-MM-DD HH:mm:ss')){
                  return Promise.reject(utils.intl('原点号停用时间不能大于新点号启用时间'));
                }
                return Promise.resolve();
              },
            }),
          ]}>
          <DatePicker showTime disabledDate={(currentDate) => moment().isBefore(currentDate)} style={{ width: '100%' }} onChange={handleStartTimeChange} />
        </FormItem>
        <FormItem label={utils.intl('新点号起始示值')} name="startValue">
          <InputNumber disabled style={{ width: '100%' }} />
        </FormItem>
      </Form>
      <div className="form-footer">
        <Button onClick={onCancel}>{utils.intl('取消')}</Button>
        <Button type="primary" loading={props.loading} onClick={() => onOk(form)}>{utils.intl('确定')}</Button>
      </div>
    </div>
  )
}

export default RemotePulseForm