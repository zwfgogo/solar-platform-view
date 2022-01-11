import React, { Component, useEffect, useState } from 'react';
import { Input, Select, Row, Col, Form, Checkbox, Modal, AutoComplete } from 'wanke-gui';
import { connect } from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'
import { makeConnect } from '../../../umi.helper'
import { startWithChineseLetterOrNumberRule, checkTextDataForNORMA } from '../../../../util/ruleUtil'
import utils from '../../../../public/js/utils';
import CheckboxGroup from '../../../../components/input-item/CheckboxGroup';
import './add-form.less';

const FormItem = Form.Item;

const _Form = props => {
  const { dispatch, addModal, record, modalTitle, arr, terminalNumber, regionsArr, devicePropertiesArr, yesOrNo, typeId, inputOutputTypesArr, deviceCategoriesArr, saveLoading, judgeinputOutput } = props;
  const [, forceUpdate] = useState({})
  const [form] = Form.useForm();
  const cancel = () => {
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        addModal: false,
        arr: [1, 1]
      },
    });
  };
  const terminalSelect = o => {
    let arrRes = []
    for (let i = 1; i <= o; i++) {
      arrRes.push(1)
    }
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        arr: arrRes
      },
    }).then(res => {
      changeNum(arrRes);
      getinputOutputTypes();
    });
  }
  const changeNum = (o) => {
    let inputOutputAllArr = []
    for (let i = 0; i < o.length; i++) {
      for (let j = 0; j < inputOutputTypesArr.length; j++) {
        if ((form.getFieldValue('terminal' + i) && form.getFieldValue('terminal' + i).type) === inputOutputTypesArr[j].value && inputOutputAllArr.indexOf(inputOutputTypesArr[j].group) === -1) {
          inputOutputAllArr.push(inputOutputTypesArr[j].group)
        }
      }
    }
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        judgeinputOutput: inputOutputAllArr,
      },
    });
  }
  const changeDev = () => {
    let inputOutputAllArr = []
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < inputOutputTypesArr.length; j++) {
        if (
          (form.getFieldValue('terminal' + i) &&
          form.getFieldValue('terminal' + i).type) === inputOutputTypesArr[j].value &&
          inputOutputAllArr.indexOf(inputOutputTypesArr[j].group) === -1
        ) {
          inputOutputAllArr.push(inputOutputTypesArr[j].group)
        }
      }
    }
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        judgeinputOutput: inputOutputAllArr,
      },
    });
  }


  const getinputOutputTypes = () => {
    dispatch({
      type: 'deviceModel/getinputOutputTypes',
      payload: {
        inputOutputReverse: form.getFieldValue('inputOutputReverse'),
        terminalNum: form.getFieldValue('terminalNum')
      },
    });
  }
  const getOutInput = (o) => {
    dispatch({
      type: 'deviceModel/updateState',
      payload: {
        judgeinputOutput: [],
        judgeReverse: o
      },
    });
    getinputOutputTypes();
    for (let i = 0; i < form.getFieldValue('terminalNum'); i++) {
      form.setFieldsValue({ ['terminal' + i]: { type: '' } })
    }
  }

  const formItemLayout = {
    wrapperCol: { span: 20 }
  }
  const formItemLayout1 = {
    labelCol: { span: 6 }
  }
  function getCheckRepeat(index) {
    return (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      for (let i = 0; i < index; i++) {
        let valueAtIndex = form.getFieldValue('terminal' + i)?.name
        if (!valueAtIndex) {
          continue
        }
        if (value.trim() == valueAtIndex.trim()) {
          return callback(utils.intl('名称重复'))
        }
      }
      return callback()
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    form.validateFields().then((values) => {
      if (modalTitle !== '新增' && record.terminals) {
        record.terminals.forEach((item, index) => {
          const key = `terminal${index}`
          if (item.id && values[key]) {
            values[key].id = item.id
          }
        })
      }

      dispatch({
        type: 'deviceModel/save',
        payload: {
          values,
        },
      });
    })
  }
  let regionsArrInfo = regionsArr && regionsArr.map((o, i) => {
    return (
      <Col span={4}>
        <Checkbox value={o.value} key={i}>
          {o.name}
        </Checkbox>
      </Col>
    )
  })

  const quickRename = (index) => {
    let nameList = []
    let nearName = ''
    let nearType = undefined
    let nearNum = -1
    let dI = 1000

    for (let i = 0; i < arr.length; i++) {
      if (i === index) continue
      const targetVal = form.getFieldValue('terminal' + i)
      if (targetVal && targetVal.name) {
        nameList.push(targetVal.name)
        if (i > index) continue
        if (dI > Math.abs(i - index)) {
          dI = Math.abs(i - index)
          let num = targetVal.name.match(/\d+$/g)?.[0] || ''
          nearNum = num ? Number(num.slice(-2)) : -1

          if (num.length >= 2) {
            nearName = targetVal.name.slice(0, -2)
            nearType = targetVal.type
          } else if (num.length === 0) {
            nearName = targetVal.name
            nearType = targetVal.type
          } else {
            nearName = targetVal.name.slice(0, -1)
            nearType = targetVal.type
          }
        }
      }
    }

    if (nearName && nameList.length) {
      // 最多35个数字，1000只是随手写的，等价于true 防止意外死循环
      while (nearNum < 1000) {
        nearNum++
        let nextNumStr = ('00' + nearNum).slice(-2)
        let nextTitle = nearName + nextNumStr
        if (!nameList.includes(nextTitle)) {
          // const lastVal = form.getFieldValue('terminal' + index) || {}
          form.setFieldsValue({ ['terminal' + index]: { name: nextTitle, type: nearType } })
          break
        }
      }
    }
  }

  let initialValues = {}
  record.terminals && record.terminals.forEach((item, index) => {
    initialValues['terminal' + index] = modalTitle === '新增' ? '' : { name: item.title, type: item.inputOutputType.id }
  })
  let language = localStorage.getItem('language');
  const isZh = language === 'zh';
  const isDisabled = (getFieldValue, index) => {
    let flag = true
    for (let i = 0; i < index; i++) {
      const target = getFieldValue(`terminal${i}`)
      if (target && target.name) {
        flag = false;
        break;
      }
    }
    return flag
  }

  useEffect(() => {
    setTimeout(() => {
      forceUpdate({})
    })
  }, [])

  return (
    <Modal
      centered
      maskClosable={false}
      bodyStyle={{ color: 'white' }}
      width={1000}
      visible={addModal}
      title={utils.intl(modalTitle)}
      onOk={handleSubmit}
      onCancel={cancel}
      wrapClassName={'customerModal basic-model-add-device-dialog'}
      confirmLoading={saveLoading}
    >
      <div style={{ paddingRight: 64 }}>
        <Form
          form={form}
          layout={language === 'zh' ? 'horizontal' : 'vertical'}
          autoComplete="off"
          labelCol={language === 'zh' ? { span: 7 } : undefined}
          wrapperCol={language === 'zh' ? { span: 20 } : undefined}
          initialValues={{
            ...initialValues,
            name: record.name || typeId,
            title: record.title || '',
            terminalNum: (record.terminals && record.terminals.length) || 2,
            energyUnitTypeIdList: record.energyUnitTypeIdList || '',
            devicePropertyId: record.deviceProperty ? record.deviceProperty.id : devicePropertiesArr[0].value,
            inputOutputEqual: record.inputOutputEqual ?? false,
            inputOutputReverse: record.inputOutputReverse ?? true,
            deviceCategoryTitle: record.deviceCategoryTitle || '',
            regionIds: record.regionIds ? record.regionIds.split('，').map(Number) : []
          }}
        >
          <Row gutter={100}>
            <Col span={12}>
              <FormItem
                name="devicePropertyId"
                rules={[{ required: true, message: utils.intl('请选择设备性质') }]}
                label={utils.intl('设备性质')}><Select dataSource={devicePropertiesArr} onChange={() => forceUpdate({})} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="deviceCategoryTitle"
                rules={[{ max: 30, required: true, message: utils.intl('请输入30字符以内设备大类') }, checkTextDataForNORMA()]}
                label={utils.intl('设备大类')}>
                <AutoComplete
                  options={deviceCategoriesArr.map(item => ({ value: item.name, name: item.name }))}
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="name"
                rules={[{ required: false }]}
                label={utils.intl('设备类型ID')}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[{ max: 30, required: true, message: utils.intl('请输入30字符以内设备类型') }, checkTextDataForNORMA()]}
                label={utils.intl('设备类型')}><Input autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.devicePropertyId !== currentValues.devicePropertyId}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('devicePropertyId') === devicePropertiesArr[0].value ? (
                    <FormItem
                      name="terminalNum"
                      rules={[{ required: true, message: utils.intl('请选择设备端子数量') }]}
                      label={utils.intl('设备端子数量')}
                    >
                      <Select onSelect={terminalSelect} dataSource={terminalNumber} />
                    </FormItem>
                  ) : null;
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.devicePropertyId !== currentValues.devicePropertyId}
              >
                {({ getFieldValue }) => {
                  return getFieldValue('devicePropertyId') === devicePropertiesArr[0].value ? (
                    <FormItem
                      name="inputOutputEqual"
                      rules={[{ required: true }]}
                      label={utils.intl('输入/输出等效')}
                    >
                      <Select dataSource={yesOrNo} onChange={() => forceUpdate({})} />
                    </FormItem>
                  ) : null;
                }}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.inputOutputEqual !== currentValues.inputOutputEqual || prevValues.devicePropertyId !== currentValues.devicePropertyId}
              >
                {({ getFieldValue }) => {

                  return !getFieldValue('inputOutputEqual') && getFieldValue('devicePropertyId') === devicePropertiesArr[0].value ? (
                    <FormItem
                      name="inputOutputReverse"
                      rules={[{ required: true }]}
                      label={utils.intl('输入/输出可反')}
                    >
                      <Select onSelect={getOutInput} dataSource={yesOrNo} />
                    </FormItem>
                  ) : null;
                }}
              </Form.Item>
            </Col>
            {
              arr.map((o, i) => {
                return (
                  <Col span={12} style={{ minHeight: '0px' }}>
                    <FormItem
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.inputOutputEqual !== currentValues.inputOutputEqual || prevValues.devicePropertyId !== currentValues.devicePropertyId}
                    >
                      {({ getFieldValue }) => {
                        return !getFieldValue('inputOutputEqual') && getFieldValue('devicePropertyId') === devicePropertiesArr[0].value ? (
                          <Input.Group>
                            <FormItem
                              label={utils.intl('N号端子名称', i + 1)}
                              name={['terminal' + i, 'name']}
                              style={{
                                width: language === 'zh' ? '70%' : '70%',
                                float: 'left',
                                position: 'relative'
                              }}
                              rules={[
                                { required: true, message: utils.intl('请输入端子名称') },
                                { validator: getCheckRepeat(i) },
                                startWithChineseLetterOrNumberRule()
                              ]}
                              labelCol={{ span: isZh ? 10 : 24 }}
                              wrapperCol={{ span: isZh ? 14 : 24 }}
                            >
                              <Input style={{ width: 'calc(100% - 8px)' }} autoComplete="off" onChange={() => forceUpdate({})} />
                            </FormItem>
                            <FormItem
                              name={['terminal' + i, 'type']}
                              style={{
                                width: language === 'zh' ? '30%' : '30%',
                                float: 'left',
                                position: 'relative',
                                top: language !== 'zh' ? '38px' : '0'
                              }}
                              rules={[{ required: true, message: utils.intl('请选择端子输入/输出标志') }]}
                              wrapperCol={{ span: 24 }}
                            >
                              <Select style={{ width: '100%' }} onSelect={changeDev} dataSource={inputOutputTypesArr} />
                            </FormItem>
                            
                          </Input.Group>
                        ) : null;
                      }}
                    </FormItem>
                    {
                      !form.getFieldValue('inputOutputEqual') && form.getFieldValue('devicePropertyId') === devicePropertiesArr[0].value ? (
                        i !== 0 ? (
                          <a
                            style={{
                              position: 'absolute',
                              right: 42,
                              top: isZh ? 5 : 43,
                              transform: 'translateX(100%)'
                            }}
                            className={isDisabled(form.getFieldValue, i) ? 'wanke-color-grey' : ''}
                            onClick={() => quickRename(i)}
                          >{utils.intl('快捷编辑')}</a>
                        ) : null
                      ) : null
                    }
                  </Col>
                )
              })
            }
            <Col span={24}>
              <FormItem
                name="regionIds"
                {...formItemLayout1}
                rules={[{ required: true, message: utils.intl('请选择地区标识') }]}
                label={utils.intl('地区标识')}
                className={isZh ? "device-region-form-item" : undefined}
              >
                <CheckboxGroup list={regionsArr} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    saveLoading: getLoading('save')
  };
}

// const _FormRes = FormContainer.create()(_Form);
export default makeConnect('deviceModel', mapStateToProps)(_Form)