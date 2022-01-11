import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { PowerManagementInfoModal } from '../models/power-management-info'
import styles from './power-management-info.less'
import CommonHeader from './components/CommonHeader'
import { ExclamationCircleFilled, LoadingOutlined, WankeReasonSuccessOutlined } from 'wanke-icon'
import { Col, Form, FormContainer, Input, Popconfirm, Row, Select, Table1 } from 'wanke-gui'
import AbsoluteBubble from '../../../../components/AbsoluteBubble'
import OverhaulConfirmModal from './components/OverhaulConfirmModal'
import OverhaulFormModal from './components/OverhaulFormModal'
import moment from 'moment'
import { RepairStatus } from '../constant'
import PageProps from '../../../../interfaces/PageProps'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import Page from '../../../../components/Page'
import { makeConnect } from '../../../umi.helper'
import { power_management_info } from '../../../constants'
import utils from '../../../../public/js/utils'
import { isZh } from '../../../../core/env'

const { Item: FormItem } = Form

const renderTime = (text) => {
  return text ? moment(text).format('YYYY-MM-DD HH:mm') : text
}

interface Props extends PageProps, PowerManagementInfoModal, MakeConnectProps<PowerManagementInfoModal> {
  id: number
  pageTitle: string
  tableLoading: boolean
  totalCount: number
  selectedStation: any
}

const PowerManagementInfo:React.FC<Props> = (props) => {
  const { detail, overhaulPlanStatus, totalCount, selectedStation } = props

  const isWaitRepair = overhaulPlanStatus.status === RepairStatus.WAIT_REPAIR
  const isRepairing = overhaulPlanStatus.status === RepairStatus.REPAIRING

  const energyUnit = detail.energyUnit || {}
  const device = detail.device || {}

  const isStorage = energyUnit.energyUnitType?.name === 'Storage'
  const isSolar = energyUnit.energyUnitType?.name === 'Solar'
  const capacityUnit = isSolar ? 'kWp' : 'kWh'

  const columns = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
    },
    {
      title: utils.intl('计划开始时间'),
      width: 180,
      dataIndex: 'startTimePlan',
      render: renderTime
    },
    {
      title: utils.intl('计划结束时间'),
      width: 180,
      dataIndex: 'endTimePlan',
      render: renderTime
    },
    {
      title: utils.intl('检修内容'),
      dataIndex: 'desc',
      render: text => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('影响功率/容量'),
      width: isZh() ? 180 : 230,
      render: (text, record) => {
        if (isSolar || isStorage) {
          let str = ''
          str += record.power ? `${record.power}kW` : ''
          str += record.capacity ? `/${record.capacity}${capacityUnit}` : ''
          return str
        }
        return record.power ? `${record.power}kW` : ''
      }
    },
    {
      title: utils.intl('检修挂牌时间'),
      dataIndex: 'startTimeReal',
      width: 180,
      render: renderTime
    },
    {
      title: utils.intl('检修摘牌时间'),
      dataIndex: 'endTimeReal',
      width: 180,
      render: renderTime
    },
    {
      title: utils.intl('操作'),
      align: 'right',
      width: 180,
      render: (text, record) => {
        return (
          <>
            {isWaitRepair && !record.startTimeReal && !record.endTimeReal && (
              <a onClick={() => handleOverhaulPlan(true)}  style={{ marginRight: 8 }}>
                {utils.intl('检修挂牌')}
              </a>
            )}
            {isRepairing && record.startTimeReal && !record.endTimeReal && (
              <a onClick={() => handleOverhaulPlan(false)}  style={{ marginRight: 8 }}>
                {utils.intl('检修摘牌')}
              </a>
            )}
            {!record.endTimeReal && (
              <a onClick={() => handleOpenModal('edit', record)}>{utils.intl('编辑')}</a>
            )}
            {!record.startTimeReal && !record.endTimeReal && (
              <Popconfirm
                title={utils.intl('确定要删除?')}
                okText={utils.intl('确认')}
                cancelText={utils.intl('取消')}
                onConfirm={() => props.action('delete', { id: record.id, powerDeviceId: props.id })}
              >
                <a className={styles["delete-btn"]} style={{ marginLeft: 8 }}>{utils.intl('删除')}</a>
              </Popconfirm>
            )}
          </>
        )
      }
    },
  ]

  const handleOverhaulPlan = (hangUp: boolean) => {
    props.updateState({
      overhaulConfirmModalVisible: true,
      overhaulConfirmType: hangUp ? 'hangUp' : 'pickOff'
    })
  }

  // 检修列表编辑
  const handleOpenModal = (overhaulModalMode, data = {}) => {
    let record: any = { ...data }
    props.updateState({
      overhaulModalMode,
      overhaulModalVisible: true,
      overhaulPlanRecord: {
        ...record,
        influence: {
          power: record.power,
          capacity: record.capacity
        },
        startTimePlan: record.startTimePlan ? moment(record.startTimePlan) : undefined,
        endTimePlan: record.endTimePlan ? moment(record.endTimePlan) : undefined,
        deviceType: detail.deviceType,
      }
    })
  }

  useEffect(() => {
    props.action('fetchDetail', { id: props.id })
    props.action('fetchOverhaulPlanList', { id: props.id, timeZone: selectedStation.timeZone })
    props.parentPageNeedUpdate()
    return () => {
      props.action('reset')
    }
  }, [])
  let capacityStr = ''
  if (detail.ratedPower) {
    capacityStr += `${detail.ratedPower}kW`
  }
  if ((isSolar || isStorage) && detail.capacity) {
    const unit = isSolar ? 'kWp' : 'kWh'
    capacityStr += `/${detail.capacity}${unit}`
  }

  const productionTime = energyUnit.productionTime || device.productionTime

  return (
    <Page pageId={props.pageId} pageTitle={props.pageTitle}>
      <FormContainer className={styles['container']}>
        <section className={classnames(styles['card'])}>
          <CommonHeader title={utils.intl('microgrid.基础信息')}>
            {isRepairing && (
              <span className={styles['repair-tag']}>{utils.intl('检修中')}</span>
            )}
          </CommonHeader>
          <footer className={styles['form-container']}>
            <Row gutter={30}>
              <Col span={8}>
                <FormItem label={utils.intl('microgrid.电源对象')}>
                  <span style={{ verticalAlign: 'text-bottom' }}>{energyUnit.title || device.title}</span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={utils.intl('microgrid.电源类型')}>
                  <span style={{ verticalAlign: 'text-bottom' }}>{energyUnit.energyUnitType?.title || device.deviceType?.title}</span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={utils.intl('投产时间')}>
                  <span style={{ verticalAlign: 'text-bottom' }}>{productionTime ? moment(productionTime).format("YYYY-MM-DD HH:mm") : ''}</span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={utils.intl('microgrid.额定功率/容量')}>
                  <span style={{ verticalAlign: 'text-bottom' }}>{capacityStr}</span>
                </FormItem>
              </Col>
            </Row>
          </footer>
        </section>
        <section className={classnames(styles['card'])}>
          <CommonHeader title={utils.intl('microgrid.检修计划')}>
            <a className={styles['new-plan-btn']} onClick={() => handleOpenModal('new')}>{utils.intl('添加检修计划')}</a>
          </CommonHeader>
          <footer>
            <Table1
              x={1350}
              columns={columns}
              dataSource={props.overhaulPlanList}
              loading={props.tableLoading}
            />
          </footer>
        </section>
      </FormContainer>
      {props.overhaulConfirmModalVisible && <OverhaulConfirmModal id={props.id} timeZone={selectedStation.timeZone} />}
      {props.overhaulModalVisible && (
        <OverhaulFormModal
          id={props.id}
          showCapacity={isSolar || isStorage}
          isSolar={isSolar}
          maxPower={detail.ratedPower}
          maxCapacity={detail.capacity}
          timeZone={selectedStation.timeZone}
        />
      )}
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    selectedStation: state.global.selectedStation,
    tableLoading: getLoading('fetchOverhaulPlanList'),
  }
}

export default makeConnect(power_management_info, mapStateToProps)(PowerManagementInfo)
