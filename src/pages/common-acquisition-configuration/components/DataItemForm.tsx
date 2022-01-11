/**
 * 其他数据项form表单
 */
import React, { useEffect } from 'react'
import { Button, Input, Select } from 'wanke-gui';
import { Form } from 'antd';
import utils from '../../../public/js/utils';
import "./index.less"
import AliasList from './AliasList';

const FormItem = Form.Item

interface DataItemFormProps {
  loading: boolean;
  initForm: (form: any) => void;
  onCancel: () => void;
  onOk: (form: any) => void;
}

// const formLayout = {
//   labelCol: { span: 4 },
//   wrapperCol: { span: 10 },
// };

const DataItemForm: React.FC<DataItemFormProps> = (props) => {
  const { initForm, onCancel, onOk } = props
  const language = localStorage.getItem('language') || 'zh'

  const formLayout = language === 'zh' ? {
    labelCol: { span: 4 },
    wrapperCol: { span: 10 },
  } : {
    labelCol: { span: 14 },
    wrapperCol: { span: 14 },
  };

  const [form] = Form.useForm();

  useEffect(() => {
    initForm && initForm(form);
  }, [])

  return (
    <div className="form-box">
      <Form
        {...formLayout}
        layout={language === 'zh' ? 'horizontal' : 'vertical'}
        form={form}
      >

        <FormItem
          label={utils.intl('数据项名称')}
          name="typeTitle"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请输入{0}', '数据项名称') },
            { type: "string", max: 16, message: utils.intl('{0}不要超过{1}个字', '名称', 16) },
          ]}
        >
          <Input style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          label={utils.intl('点号')}
          name="pointNumber"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请输入{0}', '点号') },
            { type: "string", max: 19, message: utils.intl('{0}不要超过{1}个字', '点号', 19) },
            { pattern: /\d+/g, message: utils.intl('请输入数字类型') }
          ]}>
          <Input style={{ width: '100%' }} />
        </FormItem>
        <FormItem
          label={utils.intl('点号值别名')}
          name="alias"
          labelCol={{ span: language === 'zh' ? 4 : 12 }}
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
        <FormItem
          label={utils.intl('描述')}
          labelCol={{ span: language === 'zh' ? 4 : 14 }}
          wrapperCol={{ span: 18 }}
          name="desc"
          rules={[
            { type: "string", max: 64, message: utils.intl('{0}不要超过{1}个字', '描述', 64) },
          ]}
        >
          <Input.TextArea
            style={{ width: '100%' }}
            autoSize={{ minRows: 4, maxRows: 4 }} />
        </FormItem>
      </Form>
      <div className="form-footer">
        <Button onClick={onCancel}>{utils.intl('取消')}</Button>
        <Button type="primary" loading={props.loading} onClick={() => onOk(form)}>{utils.intl('确定')}</Button>
      </div>
    </div>
  )
}

export default DataItemForm