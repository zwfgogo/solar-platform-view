import React from 'react'
import { Popover, Table, Table1 } from 'wanke-gui'
import { InfoCircleOutlined, LogoutOutlined } from 'wanke-icon'
import utils from '../../../public/js/utils'
import CommonHeader from '../component/CommonHeader'
import { StrategyControlWay, StrategyControlWayTitleMap } from '../strategy.constant'

interface Props {
  data: any
}

const C07ControlParamsDetail: React.FC<Props> = (props) => {
  const { data = {} } = props
  const columns: any = [{
    title: utils.intl('strategy.时间点'),
    dataIndex: 'dtime'
  }, {
    title: (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span>{utils.intl('strategy.无功功率') + '(kVar)'}</span>
        <Popover content={utils.intl('注：正数表示发出无功，负数表示吸收无功')} placement="topRight">
          <InfoCircleOutlined style={{ marginLeft: 8 }} />
        </Popover>
      </span>
    ),
    dataIndex: 'value'
  }]

  if (!data.type) return null

  return (
    <div className="control-params-detail">
      <CommonHeader
        title={utils.intl('strategy.参数信息')}
        fontSize={16}
        style={{ lineHeight: '54px', height: 54 }}
      />
      <section>
        <div className="control-params-detail-line">
          <TextItem title={utils.intl('strategy.控制方式')} value={StrategyControlWayTitleMap[data.type]} />
        </div>
        <div className="control-params-detail-line">
          <TextItem title={utils.intl('strategy.执行日期')} value={`${data.startTime} ~ ${data.endTime}`} />
        </div>
        {data.type === StrategyControlWay.Automatic ? (
          <>
            <div className="control-params-detail-line">
              <TextItem title={utils.intl('strategy.电压目标')} value={data.targetVoltage} unit="V" />
              <TextItem
                title={utils.intl('strategy.允许偏差')}
                value={data.deviationRange ? `${data.deviationRange[0]}%~${data.deviationRange[1]}%` : ''}
              />
            </div>
            <div className="control-params-detail-line">
              <TextItem title={utils.intl('strategy.发出无功功率最大值')} value={data.maxReactivePowerOutput} unit="kVar" />
              <TextItem title={utils.intl('strategy.吸收无功功率最大值')} value={data.maxReactivePowerInput} unit="kVar" />
            </div>
          </>
        ) : (
          <Table
            pagination={false}
            columns={columns}
            dataSource={data.details || []}
            scroll={{ y: 500 }}
          />
        )}
      </section>
    </div>
  )
}

export default C07ControlParamsDetail

interface TextItemProps {
  title: string
  value: any
  unit?: string
}

const TextItem: React.FC<TextItemProps> = (props) => {
  return (
    <div className="control-params-text-item">
      <span className="control-params-text-item-label">{props.title}:</span>
      <span className="control-params-text-item-value">{props.value ? `${props.value}${props.unit || ''}` : ''}</span>
    </div>
  )
}
