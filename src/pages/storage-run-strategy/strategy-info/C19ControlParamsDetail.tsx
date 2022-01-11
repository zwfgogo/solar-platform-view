import React from 'react'
import utils from '../../../public/js/utils'
import CommonHeader from '../component/CommonHeader'
import { C19StrategyControlTypeTitle } from '../strategy.constant'

interface Props {
  data: any
}

const C19ControlParamsDetail: React.FC<Props> = (props) => {
  const { data = [] } = props

  return (
    <div className="control-params-detail c09-control-params-detail">
      <CommonHeader
        title={utils.intl('strategy.参数信息')}
        fontSize={16}
        style={{ lineHeight: '54px', height: 54 }}
        className="no-border"
      />
      <section>
        {data.map((item, index) => (
          <TextItem
            key={index}
            title={item.energyUnitTitle}
            value={`${C19StrategyControlTypeTitle[item.type]}, ${item.value}`}
          />
        ))}
      </section>
    </div>
  )
}

export default C19ControlParamsDetail

interface TextItemProps {
  title: string
  value: any
}

const TextItem: React.FC<TextItemProps> = (props) => {
  return (
    <div className="control-params-text-item">
      <span className="control-params-text-item-label">{props.title}:</span>
      <span className="control-params-text-item-value">{props.value ? `${props.value}` : ''}</span>
    </div>
  )
}
