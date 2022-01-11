/**
 * 点号别名组件
 */
/**
 * 量测点form页面
 */
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Input, InputNumber, Button } from 'wanke-gui';
import { Form, Space } from 'antd';
import utils from '../../../public/js/utils';
import "./index.less"
import { GfDeleteOutlined, MinusCircleOutlined, PlusOutlined } from 'wanke-icon';

const FormItem = Form.Item

interface AliasListProps {
  value?: any;
  onChange?: (value: any) => void;
}

interface AliasProps {
  value?: { p?: number, v?: string };
  onChange?: (value: { p?: number, v?: string }) => void;
}


const Alias: React.FC<AliasProps> = (props) => {
  const { value, onChange } = props

  const [pValue, setPValue] = useState(null);
  const [vValue, setVValue] = useState(null);

  useEffect(() => {
    setPValue(value?.p);
    setVValue(value?.v);
  }, [JSON.stringify(value)])

  // 数字框onChange
  const numberChange = useCallback((pValue: number) => {
    setPValue(pValue);
    const newValue = value ? { ...value, p: pValue } : { p: pValue }
    onChange && onChange(newValue);
  }, [JSON.stringify(value)])

  // 文本框onChange
  const inputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVValue(e.target.value);
    const newValue = value ? { ...value, v: e.target.value } : { v: e.target.value }
    onChange && onChange(newValue);
  }, [JSON.stringify(value)])

  return (
    <div className="alias-box">
      <InputNumber value={pValue} onChange={numberChange} style={{ width: 100 }} /> - <Input value={vValue} style={{ width: 121 }} onChange={inputChange} />
    </div>
  )
}


const AliasList: React.FC<AliasListProps> = (props) => {
  const { value = {}, onChange } = props

  const [form] = Form.useForm();

  useEffect(() => {
    if (value && !Array.isArray(value)) {
      form.setFieldsValue({
        aliasList: Object.keys(value).map(key => ({ first: { p: key, v: value[key] } }))
      });
    }
  }, [JSON.stringify(value)])

  return (
    <div className="alias-list-box">
      <Form
        form={form}
        onValuesChange={(changedValues, allValues) => {
          const newAllValues = allValues.aliasList.filter(i => i);
          const errorValue = [];
          const newValue = newAllValues.reduce((pre, item) => {
            pre[item.first.p] = item.first.v;
            errorValue.push(item.first);
            return pre
          }, {});
          if (!newAllValues.find(item => `${item.first.v}`?.length > 16))
            onChange && onChange(Object.keys(newValue).length === newAllValues.length ? newValue : errorValue);
        }}
      >
        <Form.List name="aliasList">
          {
            (fields, { add, remove }) => (
              <>
                {
                  fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'first']}
                        fieldKey={[fieldKey, 'first']}
                        validateFirst
                        rules={[
                          { required: true, message: utils.intl('请输入{0}', '点号别名') },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const aliasList = getFieldValue('aliasList').filter(i => i);
                              if (aliasList.find((i, index) => {
                                const ind = aliasList.findIndex(ii => ii.first.p === i.first.p);
                                return (i.first.p || i.first.p === 0) && ind > -1 && ind !== index
                              })) {
                                return Promise.reject(utils.intl('点号值不能重复'));
                              } else if (`${value.v}`?.length > 16) {
                                return Promise.reject(utils.intl('{0}不要超过{1}个字符', utils.intl('别名'), 16));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Alias />
                      </Form.Item>
                      <div className="remove-btn-href" style={{ borderRadius: '50%', width: 24, height: 24, cursor: "pointer", textAlign: "center" }} onClick={() => remove(name)}>
                        <GfDeleteOutlined />
                      </div>
                    </Space>
                  ))
                }
                <FormItem>
                  <Button onClick={() => add()} block icon={<PlusOutlined />}>
                  </Button>
                </FormItem>
              </>
            )
          }
        </Form.List>
      </Form>
    </div>
  )
}

export default AliasList