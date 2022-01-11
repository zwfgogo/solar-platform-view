/**
 * 点号form页面
 */
import React, { useEffect } from 'react'
import { Button, Input, Select, Checkbox } from 'wanke-gui';
import { Form } from 'antd';
import _ from 'lodash';
import utils from '../../../public/js/utils';
import "./index.less"
import AliasList from './AliasList';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

interface PointFormProps {
  unitDataSource: any[];
  accuracyDataSource: any[];
  pointNumberTitle: string;
  loading: boolean;
  initForm: (form: any) => void;
  onCancel: () => void;
  onOk: (form: any) => void;
  handlePointNumberChange: (value) => void; // 点号切换
}

const PointForm: React.FC<PointFormProps> = (props) => {
  const language = localStorage.getItem('language') || 'zh'
  const { unitDataSource = [], accuracyDataSource = [], pointNumberTitle, initForm, onCancel, onOk, handlePointNumberChange } = props

  const [form] = Form.useForm();

  const formLayout = language === 'zh' ? {
    labelCol: { span: 4 },
    wrapperCol: { span: 10 },
  } : {
    labelCol: { span: 14 },
    wrapperCol: { span: 14 },
  };

  useEffect(() => {
    initForm && initForm(form);
  }, [])

  useEffect(() => {
    form.setFieldsValue({ title: pointNumberTitle });
  }, [pointNumberTitle])

  return (
    <div className="form-box">
      <Form
        {...formLayout}
        form={form}
        layout={language === 'zh' ? 'horizontal' : 'vertical'}
        style={{ position: "relative" }}
      >
        <FormItem
          label={utils.intl('数据项名称')}
          name="typeTitle"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请输入{0}', "数据项名称") },
            { type: "string", max: 16, message: utils.intl('{0}不要超过{1}个字', '名称', 16) },
          ]}
        >
          <Input style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          name="remotePulse"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          style={{ position: "absolute", top: 0, left: 374 }}
        >
          <CheckboxGroup options={[{ label: utils.intl('遥脉信号'), value: 1 }]} />
        </FormItem>
        <FormItem
          label={utils.intl('缩写/简写')}
          name="name"
          rules={[
            { type: "string", max: 8, message: utils.intl('{0}不要超过{1}个字', '缩写/简写', 8) },
          ]}
        >
          <Input style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          label={utils.intl('初始单位')}
          name="unit"
        // rules={[{ required: true, message: utils.intl('请选择输入/输出端') }]}
        >
          <Select style={{ width: '100%' }} placeholder={utils.intl('point.无')} dataSource={unitDataSource} allowClear />
        </FormItem>
        <FormItem label={utils.intl('数据精度')} name="accuracy" rules={[
          { required: true, message: utils.intl('请输入{0}', "数据精度") }
        ]}>
          <Select style={{ width: '100%' }} dataSource={accuracyDataSource} />
        </FormItem>
        <FormItem
          label={utils.intl('点号')}
          name="pointNumber"
          validateFirst
          rules={[{ required: true, message: utils.intl('请输入{0}', '点号') }, { type: "string", max: 19, message: utils.intl('{0}不要超过{1}个字', '点号', 19) }]}>
          <Input style={{ width: '100%' }} onChange={e => _.debounce(handlePointNumberChange, 500)(e.target.value)} />
        </FormItem>
        <FormItem label={utils.intl('点号名称')} name="title" rules={[{ required: true, message: utils.intl('请选择{0}', '合适的点号') }]}>
          <Input style={{ width: '100%' }} disabled />
        </FormItem>
        <FormItem
          label={utils.intl('点号值别名')}
          name="alias"
          labelCol={{ span: language === 'zh' ? 4 : 14 }}
          wrapperCol={{ span: 12 }}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (Array.isArray(value)) {
                  return Promise.reject('');
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <AliasList />
        </FormItem>
      </Form>
      <div className="form-footer">
        <Button onClick={onCancel}>{utils.intl('取消')}</Button>
        <Button type="primary" loading={props.loading} onClick={() => onOk(form)}>{utils.intl('确定')}</Button>
      </div>
    </div>
  )
}

export default PointForm