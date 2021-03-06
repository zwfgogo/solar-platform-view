import React, { Component, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, Radio, message } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../components/input-item/InputItem'
import { makeConnect } from '../../umi.helper'
import {
  PlusCircleTwoTone,
  MinusCircleTwoTone
} from '@ant-design/icons';
import TextItem from '../../../components/input-item/TextItem'
import { startWithChineseLetterOrNumberRule, letterAndNumberRule, dataTypeExamineRule, startWithLetterRule } from '../../../util/ruleUtil'
import utils from '../../../public/js/utils';

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, addModal, record, modalTitle, arr, saveLoading, yesOrNo, numberType, numberTypeString, elementType, temporalPrecisionType, defaultUnit, numList } = props;
  const [form] = Form.useForm();
  const [typeJudge, setTypeJudge] = useState('int32');
  const cancel = () => {
    dispatch({
      type: 'modelConfig/updateState',
      payload: {
        addModal: false,
        numberTypeString: numberType[0].target,
      },
    });
  };
  const changeType = async (o, e) => {
    await setTypeJudge(e.children.slice(0, e.children.indexOf('(')))
    dispatch({
      type: 'modelConfig/updateState',
      payload: {
        numberTypeString: e.target,
      },
    });
    form.validateFields(['min']);
    form.validateFields(['max']);
  }
  const validateOnChange = () => {
    form.validateFields(['max']);
  }
  const getType = () => {
    return typeJudge;
  };

  const needInt = () => {
    return 'int32';
  };

  // const terminalSelect = (o) => {
  //   let arr = []
  //   for (let i = 1; i <= o; i++) {
  //     arr.push(1)
  //   }
  //   props.action('updateState', {
  //     arr: arr
  //   })
  // }
  const formItemLayout = {
    wrapperCol: { span: 20 }
  }
  const formItemLayout1 = {
    wrapperCol: { span: 22 }
  }
  const formItemLayout2 = {
    wrapperCol: { span: 24 },
    labelCol: { span: 4 }
  }
  const formItemLayout24 = {
    wrapperCol: { span: 24 }
  }
  const formItemLayout3 = {
    wrapperCol: { span: 24 },
    labelCol: { span: 13 }
  }
  const formItemLayout4 = {
    wrapperCol: { span: 24 },
    labelCol: { span: 11 }
  }
  function getCheckRepeat(index) {
    return (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      for (let i = 0; i < index; i++) {
        let valueAtIndex = form.getFieldValue('terminalName' + i).name
        if (!valueAtIndex) {
          continue
        }
        if (value.trim() == valueAtIndex.trim()) {
          return callback(utils.intl('????????????'))
        }
      }
      return callback()
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields().then((values) => {
      if (numList && numList.length >= 35) {
        message.error(utils.intl('????????????35???????????????'))
      } else {
        dispatch({
          type: 'deviceParameter/save',
          payload: {
            values,
          },
        });
      }
    })
  }
  const plusMethod = (o) => {
    let results = [...arr];
    results.push({ number: '', name: '' })
    props.action('updateState', {
      arr: results
    })
  }
  const minusMethod = (o) => {
    let results = [...arr];
    results.splice(o, 1)
    props.action('updateState', {
      arr: results
    })
  }
  let elementTypeInfo = elementType.map((o, i) => {
    return (
      <Col>
        <Radio value={o.value} key={i} style={{ marginRight: '10px' }}>
          {o.name}
        </Radio >
      </Col>
    )
  })
  const numberChange = (e, i) => {
    let results = [...arr];
    results[i].number = e;
    props.action('updateState', {
      arr: results
    })
  }

  const nameChange = (e, i) => {
    let results = [...arr];
    results[i].name = e;
    props.action('updateState', {
      arr: results
    })
  }

  let initialValues = {}
  record.enumValues && record.enumValues.forEach((item, index) => {
    initialValues['enumValues' + index] = modalTitle === '??????' ? '' : { name: item.name, title: item.title }
  })
  let language = localStorage.getItem('language');
  return (
    <Modal centered maskClosable={false} bodyStyle={{ color: 'white' }} width={language === 'zh' ? '900px' : '700px'} visible={addModal}
      title={utils.intl('??????????????????')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal max-height-70vh'} confirmLoading={saveLoading}>
      <div style={{ paddingLeft: language !== 'zh' ? '40px' : '0', paddingRight: language !== 'zh' ? '0' : '40px' }}>
        <FormContainer form={form} layout={language === 'zh' ? 'horizontal' : 'vertical'} autoComplete="off"
          labelCol={language === 'zh' ? { span: 8 } : undefined}
          wrapperCol={language === 'zh' ? { span: 14 } : undefined}
          initialValues={{
            ...initialValues, name: record.name || '', title: record.title || '', symbol: record.symbol || '',
            dataTypeId: record.dataType && record.dataType.id || numberType[0].value,
            min: record.min !== null ? record.min : '', max: record.max !== null ? record.max : '',
            step: record.step || '', unitId: record.unit && record.unit.id || null,
            mustFill: record.mustFill, length: record.length || '',
            timeAccuracyId: record.timeAccuracy && record.timeAccuracy.id || '',
            arrayTypeId: record.arrayType ? record.arrayType.id : '',
            arraySize: record.arraySize || '', sn: record.sn || numList && (numList.length + 1),
            description: record.description || '', boolValueObj: record.boolValues || '',
          }}>
          <Row>
            <Col span={12}>
              <FormItem
                name="sn"
                {...formItemLayout}
                label={utils.intl('?????????')}><Input disabled /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[{ max: 30, required: true, message: utils.intl('?????????30????????????????????????') }, startWithChineseLetterOrNumberRule()]}
                {...formItemLayout}
                label={utils.intl('????????????')}><Input disabled={modalTitle === '??????' && record.type !== 4} autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="name"
                rules={[{ max: 30, required: true, message: utils.intl('?????????30??????????????????id') }, startWithChineseLetterOrNumberRule()]}
                {...formItemLayout}
                label={utils.intl('??????id')}><Input disabled={modalTitle === '??????' && record.type !== 4} autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="symbol"
                rules={[{ max: 30, required: true, message: utils.intl('?????????30????????????????????????') }, startWithLetterRule()]}
                {...formItemLayout}
                label={utils.intl('????????????')}><Input disabled={modalTitle === '??????' && record.type !== 4} autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="dataTypeId"
                rules={[{ required: true }]}
                {...formItemLayout}

                label={utils.intl('????????????')}><Select disabled={modalTitle === '??????' && record.type !== 4} onSelect={changeType} dataSource={numberType} /></FormItem>
            </Col>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => (prevValues.dataTypeId !== currentValues.dataTypeId)}
            >
              {({ getFieldValue }) => {
                switch (numberTypeString) {
                  case 'int32':
                  case 'float':
                  case 'double':
                    return (
                      <Col span={24}>
                        <FormItem
                          style={{ marginBottom: '0px', width: '50%', float: 'left' }}
                          {...(language === 'zh' ? formItemLayout24 : formItemLayout)}
                        >
                          <Input.Group >
                            <FormItem
                              label={utils.intl('????????????')}
                              {...(language === 'zh' ? formItemLayout3 : '')}
                              name={'min'}
                              style={{ width: language === 'zh' ? '62%' : '40%', float: 'left', position: 'relative' }}
                              rules={[{ required: true, message: utils.intl('?????????????????????') }, dataTypeExamineRule(getType)]}
                            >
                              <Input onChange={e => validateOnChange(e.target.value)} disabled={modalTitle === '??????' && record.type !== 4} style={{ width: '100%' }} />
                            </FormItem>
                            <div style={{ float: 'left', position: 'relative', width: language === 'zh' ? '10%' : '20%', textAlign: 'center', top: language === 'zh' ? '0' : '40px' }}>
                              <span style={{ width: '100%' }}>???</span>
                            </div>
                            <FormItem
                              name={'max'}
                              style={{ width: language === 'zh' ? '28%' : '40%', float: 'left', position: 'relative', top: language === 'zh' ? '0' : '38px' }}
                              rules={[{ required: true, message: utils.intl('?????????????????????') }, dataTypeExamineRule(getType),
                              {
                                validator: function (rule, value, callback) {
                                  if (value !== '' && parseInt(value) <= parseInt(getFieldValue('min'))) {
                                    callback(utils.intl('??????????????????'));
                                  } else {
                                    callback()
                                  }
                                },
                              }
                              ]}
                            >
                              <Input onChange={e => validateOnChange(e.target.value)} disabled={modalTitle === '??????' && record.type !== 4} style={{ width: '100%' }} />
                            </FormItem>
                          </Input.Group>
                        </FormItem>
                        <FormItem
                          name="step"
                          rules={[{ required: true, message: utils.intl('???????????????0') }, {
                            validator: function (rule, value, callback) {
                              if (value !== '' && parseFloat(value) <= 0) {
                                callback(utils.intl('???????????????'));
                              } else {
                                callback()
                              }
                            },
                          }]}
                          style={{ width: '50%', float: 'left' }}
                          {...formItemLayout} label={utils.intl('??????')}>
                          <Input disabled={modalTitle === '??????' && record.type !== 4} autoComplete="off" />
                        </FormItem>
                        <FormItem
                          name="unitId"
                          rules={[{ required: false, message: utils.intl('?????????????????????') }]}
                          style={{ width: '50%', float: 'left' }}
                          {...formItemLayout} label={utils.intl('????????????')}>
                          <Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={defaultUnit} />
                        </FormItem>
                        <FormItem
                          name="mustFill"
                          rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                          style={{ width: '50%', float: 'left' }}
                          {...formItemLayout}
                          label={utils.intl('????????????')}><Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={yesOrNo} /></FormItem>
                      </Col>
                    );
                    break;
                  case 'enum':
                    return (
                      arr.map((o, i) => {
                        return (
                          <Col span={24}>
                            <FormItem
                              style={{ width: '50%', float: 'left', marginBottom: '0px' }}
                              {...(language === 'zh' ? formItemLayout24 : formItemLayout)}
                            >
                              <Input.Group compact>
                                <TextItem
                                  label={i === 0 ? utils.intl('?????????') : ''}
                                  name={['enumValues' + i, 'name']}
                                  value={o.number}
                                  style={{ width: language === 'zh' && i !== 0 ? '25%' : '52%', float: 'left', position: 'relative', margin: '0px', marginLeft: language === 'zh' ? i !== 0 ? '135px' : '25px' : '0' }}
                                  placeholder={utils.intl('???????????????')}
                                  onChange={(e) => numberChange(e, i)}
                                  disabled={modalTitle === '??????' && record.type !== 4}
                                  rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                                />
                                <div style={{ float: 'left', position: 'relative', width: language === 'zh' ? '10%' : '20%', textAlign: 'center', top: i === 0 && language !== 'zh' ? '40px' : '' }}>
                                  <span style={{ width: '100%' }}>???</span>
                                </div>
                                <TextItem
                                  placeholder={utils.intl('???????????????')}
                                  name={['enumValues' + i, 'title']}
                                  style={{ width: language === 'zh' ? '25%' : '40%', float: 'left', position: 'relative', margin: '0px', top: i === 0 && language !== 'zh' ? '38px' : '' }}
                                  value={o.name}
                                  onChange={(e) => nameChange(e, i)}
                                  disabled={modalTitle === '??????' && record.type !== 4}
                                  rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                                />
                              </Input.Group>
                              <div onClick={plusMethod.bind(this, arr.length)} style={{ right: language === 'zh' ? '0px' : '-20px', position: 'absolute', top: i === 0 && language !== 'zh' ? '34px' : '-4px', cursor: 'pointer' }}  >
                                <PlusCircleTwoTone />
                              </div>
                              {arr.length === 1 ? '' :
                                <div onClick={minusMethod.bind(this, i)} style={{ right: language === 'zh' ? '0px' : '-20px', position: 'absolute', top: i === 0 && language !== 'zh' ? '52px' : '14px', cursor: 'pointer' }} >
                                  <MinusCircleTwoTone twoToneColor={'#ff4d4f'} />
                                </div>
                              }
                            </FormItem>
                            {
                              i === 0 ?
                                <FormItem
                                  name="mustFill"
                                  style={{ width: '50%', float: 'left' }}
                                  {...formItemLayout}
                                  rules={[{ required: true, message: utils.intl('?????????????????????') }]}

                                  label={utils.intl('????????????')}><Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={yesOrNo} className={'select100'} /></FormItem>
                                : ''
                            }
                          </Col>
                        )
                      })
                    )
                    break;
                  case 'bool':
                    return (
                      <Col span={12}>
                        <FormItem
                          style={{ marginBottom: '0px' }}
                          {...(language === 'zh' ? formItemLayout24 : formItemLayout)}
                        >
                          <Input.Group>
                            <FormItem
                              {...(language === 'zh' ? formItemLayout4 : '')}
                              label={<span style={{ whiteSpace: 'nowrap' }}>{utils.intl('?????????')}</span>}
                              name={['boolValueObj', 'false']}
                              style={{ width: language === 'zh' ? '50%' : '42%', float: 'left', position: 'relative', marginLeft: language === 'zh' ? '42px' : '0' }}
                              rules={[{ required: true, message: utils.intl('??????????????????') }]}
                            >
                              <Input disabled={modalTitle === '??????' && record.type !== 4} addonBefore={'0-'} style={{ width: '100%' }} />
                            </FormItem>
                            <div style={{ float: 'left', position: 'relative', width: language === 'zh' ? '59px' : '16%', textAlign: 'center', top: language === 'zh' ? '0' : '38px' }}>
                              <span style={{ width: '100%' }}>???</span>
                            </div>
                            <FormItem
                              name={['boolValueObj', 'true']}
                              style={{ width: language === 'zh' ? '25%' : '42%', float: 'left', position: 'relative', top: language === 'zh' ? '0' : '38px' }}
                              rules={[{ required: true, message: utils.intl('??????????????????') }]}
                            >
                              <Input disabled={modalTitle === '??????' && record.type !== 4} addonBefore={'1-'} style={{ width: '100%' }} />
                            </FormItem>
                          </Input.Group>
                        </FormItem>
                      </Col>
                    );
                    break;
                  case 'text':
                    return (
                      <Col span={12}>
                        <FormItem
                          name="length"
                          rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                          {...formItemLayout} label={utils.intl('????????????')}>
                          <Input disabled={modalTitle === '??????' && record.type !== 4} addonAfter={utils.intl('??????')} style={{ width: '100%' }} />
                        </FormItem>
                      </Col>
                    );
                    break;
                  case 'date':
                    return (
                      <Col span={12}>
                        <FormItem
                          name="timeAccuracyId"
                          rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                          {...formItemLayout} label={utils.intl('????????????')}>
                          <Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={temporalPrecisionType} />
                        </FormItem>
                      </Col>
                    );
                    break;
                  case 'array':
                    return (
                      <Col span={24}>
                        <FormItem name="arrayTypeId" style={{ width: '50%', float: 'left' }} rules={[{ required: true, message: utils.intl('?????????????????????') }]} {...formItemLayout} label={utils.intl('????????????')}>
                          <Radio.Group style={{ width: '100%' }} disabled={modalTitle === '??????' && record.type !== 4}>
                            <Row>{elementTypeInfo}</Row>
                          </Radio.Group>
                        </FormItem>
                        <FormItem
                          name="arraySize"
                          rules={[{ required: true, message: ' ' },
                          {
                            validator: function (rule, value, callback) {
                              if (value < 1 || value > 16) {
                                callback(utils.intl('??????????????????1~16???????????????'));
                              } else if (!/^\d+$/.test(value)) {
                                callback(utils.intl('?????????????????????'));
                              } else {
                                callback()
                              }
                            },
                          }]}
                          {...formItemLayout} label={utils.intl('????????????')}>
                          <Input disabled={modalTitle === '??????' && record.type !== 4} style={{ width: '100%' }} />
                        </FormItem>
                      </Col>
                    );
                    break;
                    defalut:
                    break;
                }
              }}
            </Form.Item>
            {({ getFieldValue }) => {
              {
                numberTypeString === 'array' ?
                  <Col span={12}>
                    <FormItem
                      name="mustFill"
                      rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                      {...formItemLayout}
                      label={utils.intl('????????????')}><Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={yesOrNo} /></FormItem>
                  </Col>
                  : ''
              }
            }}

            {numberTypeString === 'int32' || numberTypeString === 'float' || numberTypeString === 'double' || numberTypeString === 'enum' ?
              ''
              :
              <Col span={12}>
                <FormItem
                  name="mustFill"
                  rules={[{ required: true, message: utils.intl('?????????????????????') }]}
                  {...formItemLayout}
                  label={utils.intl('????????????')}><Select disabled={modalTitle === '??????' && record.type !== 4} dataSource={yesOrNo} /></FormItem>
              </Col>
            }
            <Col span={24}>
              <FormItem
                {...(language === 'zh' ? formItemLayout2 : formItemLayout1)}
                name="description"
                rules={[
                  { required: false },
                  { max: 50, message: utils.intl('????????????50?????????') }
                ]}
                label={utils.intl('??????')}>
                <Input.TextArea
                  style={{ resize: 'none', height: '80px' }}
                  placeholder={utils.intl('??????????????????50???????????????')}
                  autoComplete="off" />
              </FormItem>
            </Col>
          </Row>
        </FormContainer>
      </div>
    </Modal >
  );
};
//??????layout model ?????????title
function mapStateToProps(model, getLoading, state) {
  return {
    ...model
  };
}

export default makeConnect('modelConfig', mapStateToProps)(_Form)