/**
 * 量测点form页面
 */
import React, { useEffect } from 'react'
import { Button, Input, Select } from 'wanke-gui';
import { Form } from 'antd';
import utils from '../../../public/js/utils';
import "./index.less"

const FormItem = Form.Item

interface MeasurePointsFormProps {
  terminalDataSource: any[];
  secondaryDataSource: any[];
  noTerminal: boolean;
  loading: boolean;
  initForm: (form: any) => void;
  onCancel: () => void;
  onOk: (form: any) => void;
}

const MeasurePointsForm: React.FC<MeasurePointsFormProps> = (props) => {
  const { terminalDataSource = [], secondaryDataSource = [], noTerminal, initForm, onCancel, onOk } = props

  const [form] = Form.useForm();
  const language = localStorage.getItem('language') || 'zh'

  const formLayout = language === 'zh' ? {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  } : {
    labelCol: { span: 18 },
    wrapperCol: { span: 18 },
  };

  useEffect(() => {
    initForm && initForm(form);
  }, [])

  useEffect(() => {
    if (noTerminal) { // 默认端子
      form.setFieldsValue({
        title: utils.intl('公共测量点'),
        terminal: utils.intl('默认端子')
      })
    }
  }, [noTerminal])

  return (
    <div className="form-box">
      <Form
        {...formLayout}
        layout={language === 'zh' ? 'horizontal' : 'vertical'}
        form={form}
      >

        <FormItem
          label={utils.intl('测量点名称')}
          name="title"
          validateFirst
          rules={[
            { required: true, message: utils.intl('请输入{0}', '测量点名称') },
            { type: "string", max: 16, message: utils.intl('{0}不要超过{1}个字', '名称', 16) },
          ]}
        >
          <Input style={{ width: '100%' }} />
        </FormItem>
        <FormItem label={utils.intl('输入/输出端')} name="terminal" rules={[{ required: true, message: utils.intl('请选择{0}', "输入/输出端") }]}>
          <Select style={{ width: '100%' }} dataSource={terminalDataSource} disabled={noTerminal} />
        </FormItem>
        <FormItem label={utils.intl('绑定二次设备')} name="secondaryDevices">
          <Select mode="multiple" checkAllText={utils.intl("全选")} selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>} maxTagCount='responsive' style={{ width: '100%' }} dataSource={secondaryDataSource} />
        </FormItem>
      </Form>
      <div className="form-footer">
        <Button onClick={onCancel}>{utils.intl('取消')}</Button>
        <Button type="primary" loading={props.loading} onClick={() => onOk(form)}>{utils.intl('确定')}</Button>
      </div>
    </div>
  )
}

export default MeasurePointsForm