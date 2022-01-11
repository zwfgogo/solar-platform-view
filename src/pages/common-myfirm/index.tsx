import React, { useEffect, useState } from 'react'
import { Button, Row, Col, message, Input, Form, FullLoading, PhoneInput } from 'wanke-gui'
import Header from '../../components/Header'
import Page from '../../components/Page'

import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { makeConnect } from '../umi.helper'
import { Mode } from '../constants'
import './index.less'
import ImageType from './component/ImageType'
import LogoModal from './component/LogoModal'
import { getImageUrl } from '../page.helper'
import { checkPhone, numberStringRule } from '../../util/ruleUtil'

// 最外层页面
interface Props extends PageProps {
  updateState: any
  action: any
  theme: string
  firmDetail: any;
  saveSuccess: boolean
  getDetailLoading: boolean
  lightLogoUrl: string
  darkLogoUrl: string
}

const FormItem = Form.Item;
const Index: React.FC<Props> = function (this: null, props) {
  const [status, setStatus] = useState(Mode.look)
  const [form] = Form.useForm()
  const [logoModal, setLogoModal] = useState(false)
  const { firmDetail, saveSuccess, getDetailLoading } = props;

  useEffect(() => {
    props.action('getDetail')
    return () => {
      props.action('reset')
    }
  }, [])

  useEffect(() => {
    if (saveSuccess) {
      setStatus(Mode.look)
      message.success(utils.intl('修改成功'))
      props.action('getDetail')
    }
  }, [saveSuccess])

  const onSave = () => {
    form.validateFields().then((val) => {
      props.action('save', {
        ...firmDetail,
        ...val,
        internationalCode: val.phone.code,
        phone: val.phone.phone,
        darkLogoUrl: props.darkLogoUrl,
        lightLogoUrl: props.lightLogoUrl,
        platformTitleMap: { ...firmDetail.platformTitleMap, [process.env.SYSTEM_PLATFORM]: val.platformTitle }
      });
    })
  }

  const cancel = () => {
    setStatus(Mode.look)
    props.action('getDetail')
  }

  const edit = () => {
    setStatus(Mode.update)
  }


  const formItemLayout = {
    wrapperCol: { span: 10 }
  }

  const formItemLayout1 = {
    labelCol: { span: 5 }
  }

  const getLogo = (file, name) => {
    if (file.length === 0) {
      if (name === utils.intl('浅色logo')) {
        props.action('updateState', {
          lightLogoUrl: null
        })
        props.action('updateState', {
          firmDetail: { ...firmDetail, lightLogoUrl: null },
        })
      } else {
        props.action('updateState', {
          darkLogoUrl: null
        })
        props.action('updateState', {
          firmDetail: { ...firmDetail, darkLogoUrl: null },
        })
      }
    } else {
      if (name === utils.intl('浅色logo')) {
        props.action('updateState', {
          lightLogoUrl: getImageUrl(file[0].data) + "?tempid=" + Math.random(),
        })
        props.action('updateState', {
          firmDetail: { ...firmDetail, lightLogo: file },
        })
      } else {
        props.action('updateState', {
          darkLogoUrl: getImageUrl(file[0].data) + "?tempid=" + Math.random(),
        })
        props.action('updateState', {
          firmDetail: { ...firmDetail, darkLogo: file },
        })
      }
    }
  }

  return (
    <Page
      className='myFirm'
    >
      {logoModal &&
        <LogoModal
          cancel={() => { setLogoModal(false) }}
          visible={logoModal}
          theme={props.theme}
        />
      }
      <Header borderBottom title={utils.intl('基本信息')}>
        <div style={{ position: 'absolute', right: 6, top: 3, display: 'flex' }}>
          {status === Mode.look ?
            <Button
              onClick={edit}
              type="primary"
              style={{ fontSize: 12 }}
              size="small"
            >
              {utils.intl('编辑')}
            </Button>
            :
            <>
              <Button
                onClick={onSave}
                type="primary"
                style={{ fontSize: 12 }}
                size="small"
              >
                {utils.intl('保存')}
              </Button>
              <Button
                onClick={cancel}
                style={{ marginLeft: 8, fontSize: 12 }}
                size="small"
              >
                {utils.intl('取消')}
              </Button>
            </>
          }
        </div>

      </Header>
      <div className="flex1" style={{ marginTop: 20 }}>
        {status === Mode.look ?
          getDetailLoading ? <FullLoading /> :
            <>
              <Row style={{ width: '100%' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout1}
                    label={utils.intl('单位名称')}><span>{firmDetail.title}</span></FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout1}
                    label={utils.intl('单位简称')}><span>{firmDetail.abbreviation}</span></FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout1}
                    label={utils.intl('联系人')}><span>{firmDetail.contact}</span></FormItem>
                </Col>
              </Row>
              <Row style={{ width: '100%' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout1}
                    label={utils.intl('联系电话')}><span>{(firmDetail.internationalCode ? firmDetail.internationalCode : '') +
                      (firmDetail.phone ? firmDetail.phone : '')}</span></FormItem>
                </Col>
              </Row>
              <Row style={{ width: '100%' }}>
                <div style={{ width: '100%', padding: '0 16px', height: 1 }}>
                  <div style={{ borderTop: '1px dotted #C0C2C5', width: '100%', height: 1 }}></div>
                </div>
                <Col span={8} style={{ marginTop: 32 }}>
                  <FormItem
                    {...formItemLayout1}
                    label={utils.intl('平台名称')}><span>{firmDetail?.platformTitleMap?.[process.env.SYSTEM_PLATFORM]}</span></FormItem>
                </Col>
              </Row>
              <Row style={{ width: '100%' }}>
                <Col span={8}>
                  <FormItem
                    name="logo"
                    {...formItemLayout1}
                    label={utils.intl('单位logo')}>
                    {!getDetailLoading ?
                      <>
                        <div style={{ width: 100, height: 100, marginRight: 5, display: 'inline-block', background: '#FFFFFF', borderRadius: '4px', float: 'left' }}>
                          <img style={{ top: '50%', position: 'relative', transform: 'translate(0px, -50%)' }} src={firmDetail.lightLogoUrl ? getImageUrl(firmDetail.lightLogoUrl) : null} className="w100" />
                        </div>
                        <div style={{ width: 100, height: 100, display: 'inline-block', background: '#1E2230', borderRadius: '4px' }}>
                          <img style={{ top: '50%', position: 'relative', transform: 'translate(0px, -50%)' }} src={firmDetail.darkLogoUrl ? getImageUrl(firmDetail.darkLogoUrl) : null} className="w100" />
                        </div>
                      </>
                      : ''
                    }
                  </FormItem>
                </Col>
              </Row>
            </>
          :
          <Form
            form={form}
            initialValues={{
              title: firmDetail.title,
              abbreviation: firmDetail.abbreviation,
              contact: firmDetail.contact,
              platformTitle: firmDetail?.platformTitleMap?.[process.env.SYSTEM_PLATFORM],
              phone: { code: firmDetail.internationalCode || '+86', phone: firmDetail.phone ? firmDetail.phone.toString() : '' }
            }}
            className="flex-wrap"
            labelCol={{ span: 5 }}
            layout={'horizontal'}
          >
            <Row style={{ width: '100%' }}>
              <Col span={8}>
                <FormItem
                  name="title"
                  rules={[{ max: 64, required: true, message: utils.intl('请输入64字符以内单位名称') }]}
                  {...formItemLayout}
                  label={utils.intl('单位名称')}><Input autoComplete="off" /></FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  name="abbreviation"
                  rules={[{ max: 16, required: true, message: utils.intl('请输入16字符以内单位简称') }]}
                  {...formItemLayout}
                  label={utils.intl('单位简称')}><Input autoComplete="off" /></FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  name="contact"
                  rules={[{ max: 16, message: utils.intl('请输入16字符以内联系人') }]}
                  {...formItemLayout}
                  label={utils.intl('联系人')}><Input autoComplete="off" /></FormItem>
              </Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <Col span={8}>
                <FormItem
                  name="phone"
                  rules={[checkPhone(() => ({ maxLength: 16 }))]}
                  {...formItemLayout}
                  label={utils.intl('联系电话')}><PhoneInput autoComplete="off" /></FormItem>
              </Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <div style={{ width: '100%', padding: '0 16px', height: 1 }}>
                <div style={{ borderTop: '1px dotted #C0C2C5', width: '100%', height: 1 }}></div>
              </div>
              <Col span={8} style={{ marginTop: 32 }}>
                <FormItem
                  name="platformTitle"
                  rules={[{ required: true, message: utils.intl('请输入平台名称') }]}
                  {...formItemLayout}
                  label={utils.intl('平台名称')}><Input autoComplete="off" /></FormItem>
              </Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={utils.intl('单位logo')}><ImageType files={[props.lightLogoUrl ? props.lightLogoUrl : null
                    , props.darkLogoUrl ? props.darkLogoUrl : null]} onChange={getLogo} theme={props.theme} />
                  <span style={{ color: props.theme === 'light-theme' ? 'rgba(5, 10, 25, 0.45)' : '#fff', whiteSpace: 'nowrap' }}>
                    {utils.intl('图片大小为400K以内，PNG格式透明底色，')}
                    <span onClick={() => { setLogoModal(true) }} style={{ color: '#3D7EFF', cursor: 'pointer' }}>{utils.intl('点击查看logo样式。')}</span>
                  </span>
                </FormItem>
              </Col>
            </Row>
          </Form>
        }
      </div>
    </Page >
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    theme: state.global.theme,
    saveSuccess: isSuccess('save'),
    getDetailLoading: getLoading('getDetail'),
  }
}

export default makeConnect('myFirm', mapStateToProps)(Index)
