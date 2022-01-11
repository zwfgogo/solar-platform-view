import { FormInstance } from 'antd'
import React from 'react'
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'wanke-gui'
import { GfDeleteOutlined, PlusOutlined } from 'wanke-icon'
import utils from '../../../public/js/utils'
import { maxLengthRule } from '../../../util/ruleUtil'
import { yesNoBooleanOptions } from '../../constants'
import './twice-form.less'
const FormItem = Form.Item

interface Props {
  form: FormInstance<any>
}

const TwiceForm: React.FC<Props> = (props) => {
  const language = localStorage.getItem('language')

  return (
    <Form
      layout={language == 'zh' ? 'horizontal' : 'vertical'}
      form={props.form}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={6}>
          <FormItem
            label={utils.intl('电站代码')}
            name="code"
            rules={[
              { required: true, message: utils.intl('请输入电站代码') }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              max={99999999}
              min={0}
              precision={0}
              maxLength={8}
            />
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem
            label={utils.intl('是否启用心跳')}
            name="useHeartbeat"
            rules={[
              { required: true, message: utils.intl('请选择是否启用心跳') }
            ]}
          >
            <Select dataSource={yesNoBooleanOptions} />
          </FormItem>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label={<span style={{ width: language == 'zh' ? '4.8em' : 'unset', textAlign: 'right', display: 'inline-block' }}>DPU ID</span>}
            className="dpu-form-item"
          >
            <Form.List
              name="beeIds"
              rules={[]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        rules={[
                          {
                            required: true,
                            message: utils.intl('请输入'),
                          },
                          maxLengthRule(32)
                        ]}
                        noStyle
                      >
                        <Input style={{ width: 120 }} />
                      </Form.Item>
                      <GfDeleteOutlined
                        className="dpu-delete-icon wanke-color-blue"
                        onClick={() => remove(field.name)}
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      onClick={() => add()}
                      style={{ width: 48 }}
                    >
                      <PlusOutlined />
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default TwiceForm
