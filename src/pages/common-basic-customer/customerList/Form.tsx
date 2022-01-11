import React, { useState } from 'react'
import classnames from 'classnames'
import { Button, Form, FormContainer, Modal, Radio, SelectItem, TextItem } from 'wanke-gui'
import Upload from '../../../public/components/Upload/index'
import gdata from '../../../public/js/gdata'
import { CustomerListState } from '../models/customer-list'
import { ActionProp, UpdateStateAction } from '../../../interfaces/MakeConnectProps'
import { FormComponentProps } from '../../../interfaces/CommonInterface'
import Label from '../../../components/Label'
import utils from '../../../public/js/utils'
import { checkPhone } from '../../../util/ruleUtil'
import PhoneInputItem from '../../../components/input-item/PhoneInputItem'
import { isZh } from '../../../core/env'
import ImageType from '../../common-myfirm/component/ImageType'
import { getImageUrl } from '../../page.helper'
import LogoModal from '../../common-myfirm/component/LogoModal'

// Todo: 校验逻辑 国际化
const individualLable = utils.intl('终端用户')?.toLowerCase()
const FormItem = Form.Item;

function isIndividual(target) {
  return target.name === individualLable || target.codeName === 'FinalUser'
}

function filterCustomerType(customerType: any[], individual: number) {
  if (individual == 1) return customerType
  return customerType.filter(item => isIndividual(item))
}

type ModelKey = Pick<CustomerListState,
  'modalTitle' | 'modal' | 'customerType' | 'operationRes' | 'imageUrl' | 'showRes' | 'firmTypeTitle'
  | 'id' | 'individual' | 'title' | 'abbreviation' | 'firmTypeId' | 'contact' | 'phone' | 'activity' | 'activityCanUpdate' | 'platformTitle'>

interface Props extends ModelKey, UpdateStateAction<any>, FormComponentProps, ActionProp {
  loading: boolean
  loginFirmId: number
  changeValidAuthority: boolean
  theme: any;
  lightLogoUrl: any;
  darkLogoUrl: any;
  editDetail: any;
}

const _Form: React.FC<Props> = function (this: null, props) {
  const { modalTitle, modal, customerType, operationRes, imageUrl, showRes, loading } = props
  const [logoModal, setLogoModal] = useState(false)
  const cancel = () => {
    props.action('updateState', {
      modal: false,
      showRes: false
    })
  }
  const know = () => {
    if (props.operationRes.errorCode == 300) {
      props.updateState({ showRes: false })
      return
    }
    props.action('updateState', {
      modal: false,
      showRes: false
    })
    props.action('$getList')
  }

  // function callback(o, url) {
  //   props.action('updateState', {
  //     imageUrl: '',
  //     logoUrl: ''
  //   })
  //   if (o.length) {
  //     let file = { name: '', thumbUrl: '' };
  //     file.name = o
  //     file.thumbUrl = url
  //     gdata('fileList', {
  //       fileList: file
  //     })
  //   } else {
  //     gdata('fileList', {
  //       fileList: ''
  //     })
  //   }
  // }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then(() => {
      props.action('$save')
    })
  }

  function onIndividualChange(individual) {
    props.updateState({ individual })
    if (individual) {
      const target = customerType.find(item => isIndividual(item))
      if (target) {
        props.updateState({ firmTypeId: target.value })
      }
    }
  }

  let footer
  if (showRes) {
    footer = { footer: false, title: utils.intl('操作结果') }
  } else {
    footer = { title: modalTitle }
  }

  const {
    changeValidAuthority, id, individual, title, abbreviation, firmTypeId, firmTypeTitle,
    contact, phone, activity, loginFirmId, activityCanUpdate, platformTitle
  } = props

  const callback = (file, name) => {
    if (file.length === 0) {
      if (name === utils.intl('浅色logo')) {
        props.action('updateState', {
          lightLogoUrl: null
        })
        props.action('updateState', {
          editDetail: { ...props.editDetail, lightLogoUrl: null },
        })
      } else {
        props.action('updateState', {
          darkLogoUrl: null
        })
        props.action('updateState', {
          editDetail: { ...props.editDetail, darkLogoUrl: null },
        })
      }
    } else {
      if (name === utils.intl('浅色logo')) {
        props.action('updateState', {
          lightLogoUrl: getImageUrl(file[0].data) + "?tempid=" + Math.random(),
        })
        props.action('updateState', {
          editDetail: { ...props.editDetail, lightLogo: file },
        })
      } else {
        props.action('updateState', {
          darkLogoUrl: getImageUrl(file[0].data) + "?tempid=" + Math.random(),
        })
        props.action('updateState', {
          editDetail: { ...props.editDetail, darkLogo: file },
        })
      }
    }
  }

  return (
    <>
      <Modal
        centered
        width={'700px'}
        visible={modal}
        onOk={handleSubmit}
        onCancel={cancel}
        wrapClassName={'customerModal fixed-label-width-form'}
        destroyOnClose={true}
        confirmLoading={props.loading}
        {...footer}
      >
        {showRes ? (
          <div className="flex-column f-tac">
            <div>{operationRes.errorCode === 0 ? <img src={require('./newSuccess.png')} /> : <img src={(require('./newFail.png'))} />}</div>
            <div>
              <span className={classnames('f-fs18 f-db e-mt20 common-label', { red: operationRes.errorCode === 300 })}>
                {`"` + operationRes.firm + `" ` + utils.intl('新增') + (operationRes.errorCode === 300 ? utils.intl('失败！') : utils.intl('成功！'))}
              </span>
              {operationRes.errorCode === 300 ? (
                <div className="f-tal" style={{ height: '80px', marginTop: '30px' }}>
                  <div className="f-db e-mt20" style={{ textAlign: 'center' }}>
                    {utils.intl('可能原因')}{utils.intl('：')} {operationRes.errorMsg}
                  </div>
                </div>
              ) : operationRes.name && (
                <div className="f-tal" style={{ transform: 'translate(-50,0)', left: '42%', position: 'relative', height: '80px', marginTop: '30px' }}>
                  <span className="f-db e-mt20" style={{ width: '50%' }}>
                    {utils.intl('账号')}{utils.intl('：')} <span style={{ color: '#3a75f8' }}>{operationRes.name !== '' ? operationRes.name : ''}</span>
                  </span>
                  <span className="f-db e-mt20" style={{ width: '50%' }}>
                    {utils.intl('密码')}{utils.intl('：')} <span style={{ color: '#3a75f8' }}>abcd1234</span>
                  </span>
                </div>
              )}
            </div>
            <div>
              <Button onClick={know} type="primary" className="e-mt20">
                {utils.intl('知道了')}
              </Button>
            </div>
          </div>
        ) : (
          <FormContainer
            form={props.form}
            className="d-flex flex-wrap"
            initialValues={{
              phone: phone
            }}
          >
            <SelectItem
              label={utils.intl('客户性质')} rules={[{ required: true, message: utils.intl('请选择客户性质') }]}
              dataSource={[{ value: 1, name: utils.intl('客户单位') }, { value: 2, name: utils.intl('个人') }]}
              value={individual} onChange={onIndividualChange}
              disabled={modalTitle === utils.intl('编辑客户')}
            />

            <TextItem label={utils.intl('客户名称')}
              rules={[{ max: 64, required: true, message: utils.intl('请输入64字符以内客户名称') }]}
              value={title} onChange={v => props.updateState({ title: v })} />

            {
              individual == 1 && (
                <TextItem label={utils.intl('客户简称')}
                  rules={[{ max: 16, required: true, message: utils.intl('请输入16字符以内客户简称') }]}
                  value={abbreviation} onChange={v => props.updateState({ abbreviation: v })} />
              )
            }

            {
              <SelectItem
                label={utils.intl('客户类型')} rules={[{ required: true, message: utils.intl('请选择客户类型') }]}
                dataSource={filterCustomerType(customerType, individual)}
                value={firmTypeId} onChange={v => props.updateState({ firmTypeId: v })}
                disabled={modalTitle === utils.intl('编辑客户')}
              />
            }

            {
              individual == 1 && (
                <TextItem label={utils.intl('联系人姓名')} rules={[{ max: 16, message: utils.intl('请输入16字符以内联系人姓名') }]}
                  value={contact} onChange={v => props.updateState({ contact: v })}
                />
              )
            }
            <PhoneInputItem
              label={utils.intl('联系电话')}
              required={individual == 2}
              rules={[checkPhone(() => ({ required: individual == 2, maxLength: 16 }))]}
              value={phone}
              onChange={v => props.updateState({ phone: v })}
            />
            {
              individual == 2 && (
                <div className="w100 v-center" style={{ paddingBottom: 24 }}>
                  <Label style={{ marginLeft: 10, position: 'relative', top: 1, width: isZh() ? 100 : null }} horizontal={true}>{utils.intl('个人账号')}</Label>
                  <Radio style={{ marginLeft: 2 }} checked={true}><span style={{ marginLeft: 6, top: '1px', position: 'relative' }}>{utils.intl('使用联系电话创建账号')}</span></Radio>
                </div>
              )
            }
            <SelectItem
              label={utils.intl('有效性')}
              dataSource={[{ name: utils.intl('有效'), value: 1 }, { name: utils.intl('无效'), value: -1 }]}
              value={activity} onChange={v => props.updateState({ activity: v })}
              disabled={!activityCanUpdate || !changeValidAuthority || (firmTypeId === 1 && id === loginFirmId)}
            />

            <TextItem label={utils.intl('平台名称')}
              rules={[{ max: 64, required: true, message: utils.intl('请输入64字符以内平台名称') }]}
              value={platformTitle} onChange={v => props.updateState({ platformTitle: v })} />
            {
              individual == 1 && (
                // <div>
                //   <div style={{ marginBottom: 5 }}>
                //     {utils.intl('单位LOGO')}<span style={{ color: 'red', marginLeft: 5 }}>({utils.intl('限制：请上传不大于400K的正方形png图片，建议：65*65')})</span>
                //   </div>
                //   {/* <Upload callback={callback} acceptType={['png']} accept={'.png'} maxSize={400} fileUrl={imageUrl || null} /> */}
                //   <ImageType files={[props.lightLogoUrl ? props.lightLogoUrl : null
                //     , props.darkLogoUrl ? props.darkLogoUrl : null]} onChange={callback} theme={props.theme} />
                // </div>
                <FormItem
                  label={utils.intl('单位logo')}
                >
                  <ImageType
                    files={[props.lightLogoUrl ? props.lightLogoUrl : null , props.darkLogoUrl ? props.darkLogoUrl : null]}
                    onChange={callback} theme={props.theme}
                  />
                  <span style={{ color: props.theme === 'light-theme' ? 'rgba(5, 10, 25, 0.45)' : '#fff', clear: 'both', display: 'block' }}>
                    {utils.intl('图片大小为400K以内，PNG格式透明底色，')}
                    <span onClick={() => { setLogoModal(true) }} style={{ color: '#3D7EFF', cursor: 'pointer' }}>{utils.intl('点击查看logo样式。')}</span>
                  </span>
                </FormItem>
              )
            }
          </FormContainer>
        )}
      </Modal>
      {logoModal &&
        <LogoModal
          cancel={() => { setLogoModal(false) }}
          visible={logoModal}
          theme={props.theme}
        />
      }
    </>
  )
}

const _FormRes = FormContainer.create<Props>()(_Form)

export default _FormRes
