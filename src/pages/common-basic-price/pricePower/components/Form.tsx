import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form, Input, Modal } from 'wanke-gui'
import { InputNumber } from 'antd'
import FormItemUnit from '../../../../components/FormItemUnit'
import Area from '../../../../components/Area'
import { numberRule, numberRangeRule } from '../../../../util/ruleUtil'
import { makeConnect } from '../../../umi.helper'
import { FormContainer } from '../../../../components/input-item/InputItem'
import utils from '../../../../public/js/utils'
import { Currency, currency } from '../../../../pages/constants'

const FormItem = Form.Item

const ModalForm = props => {
  const { dispatch, visible, record, detailId, pricesBind } = props
  const [unit, setUnit] = useState('')
  useEffect(() => {
    setUnit(Currency[record?.currency] ?? '')
  }, [record])


  const cancel = () => {
    dispatch({
      type: 'pricePower/updateState',
      payload: {
        visible: false,
        detailId: ''
      }
    })
  }

  function handleSubmit() {
    props.form.validateFields().then((values) => {
      let areaChange = record.area?.values[0] === values?.area?.values[0];
      if (detailId && !areaChange && pricesBind) {
        Modal.error({
          title: utils.intl('提示'),
          content: utils.intl('该电价已被电站绑定，无法修改适用地区')
        })
      } else {
        dispatch({
          type: 'pricePower/save',
          payload: {
            values
          }
        })
      }
    })
  }
  const selectNation = (arr, e) => {
    setUnit(currency[arr.find(item => item.value === e).mark])
  }
  return (
    <Modal centered
      confirmLoading={props.loading}
      maskClosable={false} bodyStyle={{ color: 'white' }} width={'800px'} visible={visible} title={detailId ? utils.intl('电价编辑') : utils.intl('新增电价')}
      onOk={handleSubmit} onCancel={cancel}
      wrapClassName={'customerModal'}>
      <div>
        <Form
          initialValues={{
            id: record.id,
            title: record.title || '',
            area: record.area || { values: ['', '', '', ''], isSelectd: false },
            pvPrice: record.pvPrice || '',
            windPrice: record.windPrice || ''
          }}
          form={props.form}
          autoComplete="off">
          <FormItem name="id" noStyle><Input type="hidden" /></FormItem>
          <FormItemUnit>
            <FormItem
              name="title"
              rules={[
                {
                  required: true,
                  message: utils.intl('必填')
                },
                {
                  max: 32,
                  message: utils.intl('32个字符以内')
                }
              ]}
              label={utils.intl('电价名称')}><Input /></FormItem>
          </FormItemUnit>
          <FormItemUnit style={{ display: 'block', width: '685px' }}>
            <FormItem
              name="area"
              rules={[
                {
                  required: true
                },
                {
                  validator: function (rule, value, callback) {
                    if (value.isSelected) {
                      callback()
                    } else {
                      callback(utils.intl('请输入完整的地址'))
                    }
                  }
                }
              ]}
              label={<span>{utils.intl('适用地区')}</span>}
              className="multiple"><Area selectNation={selectNation} nationStyle={{ marginRight: '25px' }} nationWidth={325} width={101} exact={false} /></FormItem>
          </FormItemUnit>
          <FormItemUnit>
            <FormItem
              name="pvPrice"
              rules={[
                {
                  required: true,
                  message: utils.intl('电价不得为空')
                },
                numberRule(14, 4, utils.intl('小数不能超过4位，最大长度16')),
                numberRangeRule(0, 5, utils.intl('电价输入范围为0~5'))
              ]}
              label={`${utils.intl('光伏上网电价')}`}><Input addonAfter={utils.intl(unit) + '/kWh'} style={{ width: '100%' }} /></FormItem>
          </FormItemUnit>
          <FormItemUnit>
            <FormItem
              name="windPrice"
              rules={[
                {
                  required: true,
                  message: utils.intl('电价不得为空')
                },
                numberRule(14, 4, utils.intl('小数不能超过4位，最大长度16')),
                numberRangeRule(0, 5, utils.intl('电价输入范围为0~5'))
              ]}
              label={`${utils.intl('风电上网电价')}`}><Input addonAfter={utils.intl(unit) + '/kWh'} style={{ width: '100%' }} /></FormItem>
          </FormItemUnit>
        </Form>
      </div>
    </Modal>
  );
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('save')
  }
}

export default makeConnect('pricePower', mapStateToProps)(FormContainer.create()(ModalForm))
