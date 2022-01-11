import moment, { Moment } from 'moment'
import React, { useRef, useState } from 'react'
import { Button, Modal, Table, Table1 } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import { isZh } from '../../../core/env'
import utils from '../../../public/js/utils'
import { A4PageWidth, exportPDF } from '../../../util/pdfUtil'
import './operation-plan-modal.less'

const DescList = [
  utils.intl('取出"目标位置"的电池包。'),
  utils.intl('按"目标位置"找到"调入电池包编号"的电池包, 放入目标位置。'),
  utils.intl('安装、调试即可完成一次调换。'),
  utils.intl('重复2-3步骤直到所有目标位置都安装调试完毕。')
]

interface Props {
  stationName: string
  detail: any
  closeModal: () => void
}

const OperationPlanModal: React.FC<Props> = (props) => {
  const { detail, stationName = '' } = props
  const [exportLoading, setExportLoading] = useState(false)
  const pdfDomRef = useRef()

  const handleCancel = () => {
    props.closeModal()
  }

  const renderTitle = () => {
    if (true || isZh()) {
      return (
        <>
          <span>更换</span>
          <span className="operation-plan-title-value">{detail.replacePackNum}</span>
          <span>个电池包,最多调换</span>
          <span className="operation-plan-title-value">{detail.capacitySortNum}</span>
          <span>次</span>
        </>
      )
    }

    return (
      <></>
    )
  }

  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num'
    },
    {
      title: utils.intl('目标位置'),
      dataIndex: 'targetPack'
    },
    {
      title: utils.intl('调入电池包编号'),
      dataIndex: 'newPack'
    }
  ];

  const handleExportPDF = () => {
    if (pdfDomRef.current) {
      setExportLoading(true)
      exportPDF(pdfDomRef.current, `${stationName}方案`, A4PageWidth)
        .then(() => {
          setExportLoading(false)
        })
    }
  }

  const list = (detail.results || []).map((item, index) => ({ ...item, num: index + 1 }))

  return (
    <Modal
      className="operation-plan-modal"
      title={utils.intl('电池运维方案')}
      width={900}
      visible={true}
      onCancel={handleCancel}
      destroyOnClose={true}
      footer={null}
    >
      <div className="menu-list">
        <Button
          type="default"
          style={{ marginRight: 16, background: 'transparent', borderColor: 'rgb(86, 89, 10)' }}
          onClick={handleCancel}
        >{utils.intl('关闭')}</Button>
        <Button type="primary" onClick={handleExportPDF} loading={exportLoading}>{utils.intl('导出为PDF')}</Button>
      </div>
      <section className="operation-plan-body" ref={pdfDomRef}>
        <div style={{ marginBottom: 30 }}>
          <span style={{ marginRight: 16 }}>{utils.intl('battery.参数')}:</span>
          {renderTitle()}
        </div>
        <div className="operation-plan-body-header">{utils.intl('battery.运维收益')}:</div>
        <div className="summary-list">
          <SummaryCard
            title={utils.intl('每个循环可多')}
            content={(
              <>
                <span>充电</span>
                <span className="summary-value" style={{ marginRight: 4, marginLeft: 4 }}>{formatValue(detail.charge)}</span>
                <span>kWh</span>
              </>
            )}
          />
          <SummaryCard
            title={utils.intl('每天可提升收益')}
            content={(
              <>
                <span className="summary-value" style={{ marginRight: 4 }}>{formatValue(detail.profit)}</span>
                <span>元</span>
              </>
            )}
          />
          <SummaryCard
            title={utils.intl('每天可提升收益')}
            content={(
              <>
                <span className="summary-value" style={{ marginRight: 4 }}>{formatValue(detail.profitRate)}</span>
                <span>%</span>
              </>
            )}
          />
        </div>
        <div className="operation-plan-body-header">{utils.intl('battery.运维方案')}:</div>
        <Table
          pagination={false}
          columns={columns}
          dataSource={list}
        />
        <div className="operation-plan-body-header" style={{ marginTop: 24 }}>
          {utils.intl('battery.实施步骤')}:
        </div>
        {DescList.map((item, index) => (
          <div className="operation-plan-body-desc">
            <span style={{ marginRight: 16 }}>{index + 1}</span>
            <span>{item}</span>
          </div>
        ))}
        <footer>
          <span>**方案时间: {moment().format('YYYY-MM-DD')}, 请尽快实施。</span>
        </footer>
      </section>
    </Modal>
  )
}

export default OperationPlanModal

interface SummaryCardProps {
  title: string
  content: any
}

const SummaryCard: React.FC<SummaryCardProps> = (props) => {
  return (
    <div className="summary-card">
      <div className="summary-icon"></div>
      <div className="summary-body">
        <div className="summary-title">{props.title}</div>
        <div className="summary-content">
          {props.content}
        </div>
      </div>
    </div>
  )
}

function formatValue(value) {
  return value ? Number(value.toFixed(2)).toString() : (value ?? '--')
}
