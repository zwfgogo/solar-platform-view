import React, { useEffect, useState } from 'react'
import { Button, Form, message } from 'wanke-gui'
import classnames from 'classnames'
import { FormContainer } from '../../../components/input-item/InputItem'
import SelectItem from '../../../components/input-item/SelectItem'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { ValueName } from '../../../interfaces/CommonInterface'
import FullContainer from '../../../components/layout/FullContainer'
import Footer from '../../../public/components/Footer'
import { Mode } from '../../constants'
import TabManageLook from './TabManageLook'
import utils from '../../../public/js/utils'
import styles from './styles/tab-manage.less'
import FirmInfoForm from './tab-manage-form/FirmInfoForm'

//电站管理信息页签编辑
interface Props extends ActionProp {
  mode: Mode
  fetchStationManageInfoLoading: boolean
  editable: boolean
  stationId: number
  manageInfo: any
  financialType: any[]
  basicInfo: any
  userOption1: ValueName[]
  userOption2: ValueName[]
  userOption3: ValueName[]
  bindUserSuccess: boolean
  fetchStationManageInfoSuccess: boolean
  saveLoading: boolean
  parentPageNeedUpdate: (type?, data?) => void
  back: () => void
}

const TabManage: React.FC<Props> = function (this: null, props) {
  const [currentMode, setCurrentMode] = useState(props.mode == Mode.add ? Mode.add : Mode.look)

  const getCheckRule = (userList, msg) => {
    return (rule: any, value: number, callback) => {
      if (userList.find(user => user.value == value) != undefined) {
        return callback()
      }
      callback(msg)
    }
  }

  const [formData, setFormData] = useState<any>({
    user1: null,
    user2: -1,
    user3: -1,
  })

  const updateFormData = (data) => {
    setFormData({
      ...formData,
      ...data
    })
  }

  const [form] = Form.useForm()

  const onCancelEdit = () => {
    if (props.mode == Mode.add) {
      props.back()
    } else {
      initFormData(props.manageInfo);
      setCurrentMode(Mode.look)
    }
  }

  const handleSubmit = () => {
    form.validateFields().then(value => {
      const data = {
        ...props.basicInfo,
        operator: { id: formData.user1 },
        maintenance: { id: formData.user2 == -1 ? null : formData.user2 },
        finalUser: { id: formData.user3 == -1 ? null : formData.user3 },
        id: props.stationId
      }
      props.action('bindStationUser', data)
    })
  }

  useEffect(() => {
    props.action('fetchUserList')
    if (currentMode == Mode.look) {
      props.action('fetchStationManageInfo', { stationId: props.stationId })
      props.action('fetchFinancialTypeInfo')
    }
  }, [])

  useEffect(() => {
    if (props.bindUserSuccess) {
      message.success(utils.intl('更新成功'))
      setCurrentMode(Mode.look)
      props.action('fetchStationManageInfo', { stationId: props.stationId })
      props.parentPageNeedUpdate('bindUser')
    }
  }, [props.bindUserSuccess])

  const initFormData = (manageInfo) => {
    setFormData({
      user1: manageInfo.operator?.id,
      user2: manageInfo.maintenance?.id || -1,
      user3: manageInfo.finalUser?.id || -1,
    })
  }

  useEffect(() => {
    if (props.fetchStationManageInfoSuccess) {
      initFormData(props.manageInfo);
    }
  }, [props.fetchStationManageInfoSuccess])

  if (currentMode == Mode.look) {
    return (
      <TabManageLook
        editable={props.editable}
        fetchStationManageInfoLoading={props.fetchStationManageInfoLoading}
        user1Title={props.manageInfo.operator?.title || utils.intl('无')}
        user2Title={props.manageInfo.maintenance?.title || utils.intl('无')}
        user3Title={props.manageInfo.finalUser?.title || utils.intl('无')}
        formData={formData}
        action={props.action}
        toEdit={() => setCurrentMode(Mode.update)}
        back={props.back}
      />
    )
  }

  return (
    <FullContainer className="flex1">
      <article className={classnames("flex1", styles["tab-manage"])}>
        <FormContainer
          form={form}
          className="d-flex flex-wrap"
        >
          <FirmInfoForm
            formData={formData}
            updateFormData={updateFormData}
            userOption1={props.userOption1}
            userOption2={props.userOption2}
            userOption3={props.userOption3}
          />
        </FormContainer>
      </article>
      <Footer>
        <Button onClick={onCancelEdit}>
          {utils.intl("取消")}
        </Button>
        <Button type="primary" style={{ marginLeft: '10px' }} loading={props.saveLoading} onClick={handleSubmit}>
          {utils.intl("保存")}
        </Button>
      </Footer>
    </FullContainer>
  )
}

export default TabManage
