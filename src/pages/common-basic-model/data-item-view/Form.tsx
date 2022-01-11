/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal, AutoComplete } from 'wanke-gui'
import './index.less'

import { r_e_data_item } from '../../constants'
import { getActionType } from '../../umi.helper'

import { makeConnect } from '../../umi.helper'
import { FormContainer } from '../../../components/input-item/InputItem'
import utils from '../../../public/js/utils'

const FormItem = Form.Item
const _Form = props => {
  const { dispatch, record, modalTitle, modal, autoData, accuracyId, symbol, accuracy, isSaving, unitArr } = props
  const cancel = () => {
    props.action('updateState', {
      modal: false,
      accuracyId: '',
      symbol: ''
    })
  }
  const formItemLayout = {
    wrapperCol: { span: 21 }
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
      props.action('$save', {
        values
      })
    })
  }

  const filterOption = (inputValue, option) => {
    return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
  }

  const onSelect = (id) => {
    let match
    if (typeof id === 'number') {
      match = autoData.find(item => item.id === id)
    } else {
      match = autoData.find(item => item.title === id)
    }
    if (!match) return
    props.action('updateState', {
      accuracyId: match.accuracy,
      symbol: match.symbol,
      unitId: match.unit && match.unit.id
    })
    props.form.setFieldsValue({ symbol: match.symbol, accuracyId: match.accuracyId, title: match.title, unitId: match.unit && match.unit.id })
  }

  let language = localStorage.getItem('language');
  return (
    <Modal
      confirmLoading={isSaving}
      centered
      bodyStyle={{ color: 'white' }}
      width={'700px'}
      title={utils.intl(modalTitle)}
      visible={modal}
      onOk={handleSubmit}
      onCancel={cancel}
      wrapClassName={'dataModal'}
      destroyOnClose={true}
    >
      <div style={{ paddingLeft: language !== 'zh' ? '40px' : '0', paddingRight: language !== 'zh' ? '0' : '40px' }}>
        <Form
          labelCol={language === 'zh' ? { span: 10 } : undefined}
          initialValues={{
            title: record.title || '',
            symbol: record.symbol || symbol,
            accuracyId: record.accuracyId || accuracyId,
            unitId: record.unit && record.unit.id || null
          }}
          form={props.form}
          layout={language === 'zh' ? 'horizontal' : 'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem name="title" rules={[{ required: true, message: utils.intl('请选择数据项') }]} {...formItemLayout} label={utils.intl('数据项名称')}>
                {/* <Select
                  dataSource={autoData.map(item => ({ value: item.id, name: item.title }))}
                  onSelect={onSelect}
                  disabled={modalTitle === '编辑数据项'}
                  // filterOption={filterOption}
                  filterable
                >
                </Select> */}
                <AutoComplete
                  options={autoData.map(item => ({ value: item.title, name: item.title }))}
                  filterOption={filterOption}
                  onSelect={onSelect}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="symbol"
                rules={[
                  {
                    max: 8,
                    required: true,
                    message: utils.intl('请输入8字符以内符号')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('符号')}
              ><Input autoComplete="off" /></FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem
                name="unitId"
                rules={[
                  {
                    required: false,
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('单位')}
              ><Select dataSource={unitArr} className={'select100'} /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="accuracyId"
                rules={[
                  {
                    required: true,
                    message: utils.intl('请选择精度')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('界面显示精度')}
              ><Select dataSource={accuracy} className={'select100'} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}

const _FormRes = FormContainer.create()(_Form)

const mapStateToProps = (model, getLoading) => {
  const { record, modalTitle, modal, autoData, accuracyId, symbol, accuracy, unitArr } = model
  return {
    record,
    modalTitle,
    modal,
    autoData,
    accuracyId,
    symbol,
    accuracy,
    isSaving: getLoading('$save'),
    unitArr
  }
}

export default makeConnect('model_data_item', mapStateToProps)(_FormRes)
