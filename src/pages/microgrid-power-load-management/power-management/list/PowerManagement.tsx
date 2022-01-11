import React, { useEffect, useState } from 'react'
import { Button, Table1, Table2 } from 'wanke-gui'
import classnames from 'classnames'
import styles from './power-management.less'
import { PowerManagementModal } from '../models/power-management'
import { RepairStatus, RepairStatusClassName, RepairStatusTitleMap } from '../constant'
import PageProps from '../../../../interfaces/PageProps'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import AbsoluteBubble from '../../../../components/AbsoluteBubble'
import Forward from '../../../../public/components/Forward'
import Page from '../../../../components/Page'
import { makeConnect } from '../../../umi.helper'
import { power_management } from '../../../constants'
import { CrumbsPortal } from '../../../../frameset/Crumbs'
import SortableTable from '../../../../components/SortableTable'
import { isZh } from '../../../../core/env'
import utils from '../../../../public/js/utils'

interface Props extends PageProps, PowerManagementModal, MakeConnectProps<PowerManagementModal> {
  loading: boolean
  saveLoading: boolean
  stationId: number
}

const PowerManagement: React.FC<Props> = (props) => {
  const { list } = props
  const [isEdit, setIsEdit] = useState(false)
  const [editTableData, setEditTableData] = useState([])

  const handleChangePosition = (type, index) => {
    let targetIndex = -1
    switch (type) {
      case 'toTop':
        targetIndex = 0
        break
      case 'up':
        targetIndex = index - 1
        break
      case 'down':
        targetIndex = index + 1
        break
      case 'toBottom':
        targetIndex = list.length - 1
        break
      default:
        break
    }

    if (targetIndex !== -1) {
      // 交换位置
      changePlace(index, targetIndex)
    }
  }

  const handleMoveRow = (dragIndex, hoverIndex) => {
    changePlace(dragIndex, hoverIndex)
  }

  const changePlace = (index, targetIndex) => {
    const newTableData = JSON.parse(JSON.stringify(editTableData));
    [newTableData[index].level, newTableData[targetIndex].level] = [newTableData[targetIndex].level, newTableData[index].level];
    [newTableData[index], newTableData[targetIndex]] = [newTableData[targetIndex], newTableData[index]];
    setEditTableData(newTableData);
  }

  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      width: 65,
      render: (text, record, index) => index + 1
    },
    {
      title: utils.intl('microgrid.电源对象'),
      dataIndex: 'title',
      width: isZh() ? 300 : 250,
      render: (text, record) => {
        const title = record.energyUnit?.title || record.device?.title || ''
        
        return (
          <AbsoluteBubble>
            <Forward to="info" data={{ id: record.id, pageTitle: title, totalCount: props.totalCount }}>
              {title}
            </Forward>
          </AbsoluteBubble>
        )
      }
    },
    {
      title: utils.intl('microgrid.设备类型'),
      width: 150,
      dataIndex: 'energyUnit',
      render: (text, record) => text?.energyUnitType?.title || record.device?.deviceType?.title || ''
    },
    {
      title: utils.intl('microgrid.额定功率/容量'),
      width: 180,
      render: (text, record) => {
        let str = ''
        if (record.ratedPower) {
          str += `${record.ratedPower}kW`
        }
        const type = record.energyUnit?.energyUnitType?.name
        const isSolar = type === 'Solar'
        const isStorage = type === 'Storage'
        if ((isSolar || isStorage) && record.capacity) {
          const unit =  isSolar ? 'kWp' : 'kWh'
          str += `/${record.capacity}${unit}`
        }
        return (
          <span>{str}</span>
        )
      }
    },
    {
      title: utils.intl('microgrid.投入优先级'),
      width: 120,
      dataIndex: 'level',
      render: (text, record, index) => index === 0 ? `${text}(${utils.intl('最高级')})` : text
    },
    {
      title: utils.intl('microgrid.检修/调试状态'),
      dataIndex: 'maintenanceStatus',
      width: isZh() ? 140 : 190,
      render: (text, record) => {
        let str = ''
        if (record.workStatus === 8) str = utils.intl('检修中')
        if (text?.name === RepairStatus.WAIT_REPAIR) str = utils.intl('待检修')
        if (record.workStatus === 9) str = utils.intl('调试中')

        return (
          <span className={classnames('repair-status', {[RepairStatusClassName[text?.name]]: record.workStatus !== 9 })}>
            {str}
          </span>
        )
      }
    }
  ]

  if (isEdit) {
    columns.push({
      title: utils.intl('microgrid.调整投入优先级'),
      dataIndex: 'operation',
      width: 220,
      align: 'right',
      render: (text, record, index) => {
        const isTop = index === 0
        const isBottom = index === list.length - 1

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <a
              className={classnames(styles['btn'], { [styles['disabled']]: isTop })}
              onClick={() => handleChangePosition('toTop', index)}
            >{utils.intl('置顶')}</a>
            <span className={styles['btn-split']}></span>
            <a
              className={classnames(styles['btn'], { [styles['disabled']]: isTop })}
              onClick={() => handleChangePosition('up', index)}
            >{utils.intl('上移')}</a>
            <span className={styles['btn-split']}></span>
            <a
              className={classnames(styles['btn'], { [styles['disabled']]: isBottom })}
              onClick={() => handleChangePosition('down', index)}
            >{utils.intl('下移')}</a>
            <span className={styles['btn-split']}></span>
            <a
              className={classnames(styles['btn'], { [styles['disabled']]: isBottom })}
              onClick={() => handleChangePosition('toBottom', index)}
            >{utils.intl('置底')}</a>
          </div>
        )
      }
    })
  }

  const handleEdit = () => {
    setIsEdit(true)
    setEditTableData(list)
  }

  const handleCancel = () => {
    setIsEdit(false)
  }

  const handleSave = () => {
    props.action('putDeviceList', {
      stationId: props.stationId,
      deviceList: editTableData
    })
      .then(() => {
        setIsEdit(false)
      })
  }

  useEffect(() => {
    return () => {
      props.action('reset')
    }
  }, [])

  useEffect(() => {
    if (props.stationId) {
      props.action('fetchList', { stationId: props.stationId })
    }
  }, [props.stationId])

  return (
    <Page pageId={props.pageId} onNeedUpdate={() => props.action('fetchList', { stationId: props.stationId })} showStation>
      <CrumbsPortal pageName='list'>
        {!isEdit ? (
          <Button type="primary" onClick={handleEdit}>{utils.intl('编辑')}</Button>
        ) : (
          <>
            <Button onClick={handleCancel}>{utils.intl('取消')}</Button>
            <Button type="primary" onClick={handleSave} style={{ marginLeft: 8 }} loading={props.saveLoading}>{utils.intl('保存')}</Button>
          </>
        )}
      </CrumbsPortal>
      <section className={styles['page-container']}>
        <SortableTable
          draggable={isEdit}
          onDrag={handleMoveRow}
          columns={columns}
          dataSource={isEdit ? editTableData : list}
          loading={props.loading}
        />
      </section>
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    stationId: state.global.selectedStationId,
    loading: getLoading('fetchList'),
    saveLoading: getLoading('putDeviceList'),
  }
}

export default makeConnect(power_management, mapStateToProps)(PowerManagement)
