import React from 'react'
import utils from '../../../public/js/utils'
import { changeUnit } from '../../unit.helper'
import './styles/profit-card.less'

interface Props {
  title: string
  value: number
  targetValue: number
  offset: number
}

const ProfitCard: React.FC<Props> = (props) => {
  const valueObj = changeUnit({
    value: props.value ?? 0,
    unit: utils.intl('元')
  })
  const targetValueObj = changeUnit({
    value: props.targetValue ?? 0,
    unit: utils.intl('元')
  })

  return (
    <div className="income-analyse-profit-card">
      <div className="income-analyse-profit-card-left">
        <div className="profit-card-title">{props.title}</div>
        <div>
          <span className="profit-card-value">{valueObj.value?.toFixed(2)}</span>
          <span className="profit-card-unit">{valueObj.unit}</span>
        </div>
      </div>
      <div className="income-analyse-profit-card-right">
        <div style={{ marginBottom: 10, whiteSpace: 'nowrap' }}>
          <span className="profit-card-label">{utils.intl('目标收益')}</span>
          <span className="profit-card-value">{targetValueObj.value?.toFixed(2)}</span>
          <span className="profit-card-unit">{targetValueObj.unit}</span>
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span className="profit-card-label">{utils.intl('偏差')}</span>
          <span className="profit-card-value profit-red">{props.offset ?? 0}</span>
          <span className="profit-card-unit">%</span>
        </div>
      </div>
    </div>
  )
}

export default ProfitCard
