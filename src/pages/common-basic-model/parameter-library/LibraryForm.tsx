/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'

import { r_e_parameter_library } from '../../constants'
import { getActionType } from '../../umi.helper'


import { makeConnect } from '../../umi.helper'
import { FormContainer } from '../../../components/input-item/InputItem'
import utils from '../../../public/js/utils'

const FormItem = Form.Item
const _Form = props => {
  const { dispatch, libraryRecord, libraryModalTitle, libraryModal, newName, accuracy, unitArr } = props
  const cancel = () => {
    props.action('updateState', {
      libraryModal: false
    })
  }
  const formItemLayout = {
    wrapperCol: { span: 21 }
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
      props.parentPageNeedUpdate('updateLibrary')
      props.action('$librarySave', {
        values
      })
    })
  }
  let language = localStorage.getItem('language');
  return (
    <Modal
      centered
      bodyStyle={{ color: 'white' }}
      width={'700px'}
      title={utils.intl(libraryModalTitle)}
      visible={libraryModal}
      onOk={handleSubmit}
      onCancel={cancel}
      destroyOnClose={true}
      wrapClassName={'libraryModal'}
    >
      <div style={{ paddingLeft: language !== 'zh' ? '40px' : '0', paddingRight: language !== 'zh' ? '0' : '40px' }}>
        <Form
          labelCol={language === 'zh' ? { span: 10 } : undefined}
          initialValues={{
            name: libraryRecord.name || newName,
            title: libraryRecord.title || '',
            symbol: libraryRecord.symbol || '',
            accuracyId: libraryRecord.accuracyId || '',
            unitId: libraryRecord.unit && libraryRecord.unit.id || null
          }}
          form={props.form}
          layout={language === 'zh' ? 'horizontal' : 'vertical'}
          autoComplete="off">
          <Row>
            <Col span={12}>
              <FormItem
                name="name"
                rules={[
                  {
                    required: true,
                    message: utils.intl('请选择数据项ID')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('数据项ID')}
                hasFeedback><Input disabled autoComplete="off" /></FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="title"
                rules={[
                  {
                    max: 16,
                    required: true,
                    message: utils.intl('请输入16字符以内数据项名称')
                  }
                ]}
                {...formItemLayout}
                label={utils.intl('数据项名称')}
                hasFeedback><Input autoComplete="off" /></FormItem>
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
                hasFeedback><Input autoComplete="off" /></FormItem>
            </Col>
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
                hasFeedback><Select dataSource={unitArr} className={'select100'} /></FormItem>
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
                hasFeedback><Select dataSource={accuracy} className={'select100'} /></FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal >
  );
}

const _FormRes = FormContainer.create()(_Form)

const mapStateToProps = ({ libraryRecord, libraryModalTitle, libraryModal, newName, accuracy, unitArr }) => ({
  libraryRecord,
  libraryModalTitle,
  libraryModal,
  newName,
  accuracy,
  unitArr
})

export default makeConnect('model_parameter_library', mapStateToProps)(_FormRes)
