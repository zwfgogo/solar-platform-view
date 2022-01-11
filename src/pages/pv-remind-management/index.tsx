import React, { useEffect, useState } from 'react'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import { remind_management } from '../constants'
import { makeConnect } from '../umi.helper'
import { Mode, RemindManagementModal } from './model'
import styles from './index.less'
import Card from './components/Card'
import { Button } from 'wanke-gui'
import ContactsForm from './components/ContactsForm'
import { PlusOutlined } from 'wanke-icon'
import ContractRemind from './components/ContractRemind'
import ElectricityRemind from './components/ElectricityRemind'
import ReportRemind from './components/ReportRemind'
import ElectricityModal from './components/ElectricityModal'
import ContactModal from './components/ContactModal'
import ContractModal from './components/ContractModal'
import ReportModal from './components/ReportModal'
import Page from '../../components/Page'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'

export enum ModalName {
  Contact = 'Contact',
  Contract = 'Contract',
  Electricity = 'Electricity',
  Report = 'Report',
}

interface Props extends PageProps, MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  selectedStationId: number
}

const RemindManagement: React.FC<Props> = (props) => {
  const [modalVisibleMap, setModalVisibleMap] = useState({})

  const handleClick = (type) => {
    switch(type) {
      case ModalName.Contact:
        break;
      case ModalName.Contract:
        break;
      case ModalName.Electricity:
        break;
      case ModalName.Report:
        break;
    }
    props.updateState({ mode: Mode.new, record: {} })
    handleModal(type, true)
  }

  const handleEdit = (record, type) => {
    props.updateState({ mode: Mode.edit, record })
    handleModal(type, true)
  }

  const handleModal = (modalName, visible) => {
    setModalVisibleMap({ ...modalVisibleMap, [modalName]: visible })
  }

  useEffect(() => {
    if (props.selectedStationId) {
      props.action('fetchUserList', { id: props.selectedStationId })
      props.action('fetchRemindSettings', { id: props.selectedStationId })
      props.action('fetchRemindInto', { id: props.selectedStationId })
    }
  }, [props.selectedStationId])

  return (
    <Page
      showStation={true}
      pageId={props.pageId}
      pageTitle={utils.intl('remind.提醒管理')}
      style={{ backgroundColor: "unset" }}
    >
      <article className={styles['page-container']}>
        <Card
          title={utils.intl('remind.联系人信息')}
          rightHeader={<AddBtn onClick={() => handleClick(ModalName.Contact)} />}
          className={styles['card']}
        >
          <ContactsForm />
        </Card>
        <Card
          title={utils.intl('remind.合约提醒')}
          rightHeader={<AddBtn onClick={() => handleClick(ModalName.Contract)} />}
          className={styles['card']}
        >
          <ContractRemind onEdit={handleEdit} />
        </Card>
        <Card
          title={utils.intl('remind.电价提醒')}
          rightHeader={<AddBtn onClick={() => handleClick(ModalName.Electricity)} />}
          className={styles['card']}
        >
          <ElectricityRemind onEdit={handleEdit} />
        </Card>
        <Card
          title={utils.intl('remind.报表推送')}
          rightHeader={<AddBtn onClick={() => handleClick(ModalName.Report)} />}
          className={styles['card']}
        >
          <ReportRemind onEdit={handleEdit} />
        </Card>
        {modalVisibleMap[ModalName.Contact] && (
          <ContactModal onClose={() => handleModal(ModalName.Contact, false)} />
        )}
        {modalVisibleMap[ModalName.Contract] && (
          <ContractModal onClose={() => handleModal(ModalName.Contract, false)} />
        )}
        {modalVisibleMap[ModalName.Electricity] && (
          <ElectricityModal onClose={() => handleModal(ModalName.Electricity, false)} />
        )}
        {modalVisibleMap[ModalName.Report] && (
          <ReportModal onClose={() => handleModal(ModalName.Report, false)} />
        )}
      </article>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    selectedStationId: state.global.selectedStationId,
    ...model,
  }
}

export default makeConnect(remind_management, mapStateToProps)(RemindManagement)

interface AddBtnProps {
  onClick?: () => void
}

const AddBtn: React.FC<AddBtnProps> = ({ onClick }) => {
  return <a className={styles['btn']} onClick={onClick}><PlusOutlined style={{ marginRight: 5 }} />{utils.intl('remind.新增提醒')}</a>
}
