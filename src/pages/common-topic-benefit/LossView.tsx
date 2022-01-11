import React, { useEffect } from 'react'
import DetailFormItem from '../../components/DetailFormItem'
import { getSystemTheme } from '../../core/env'
import utils from '../../public/js/utils'
import './loss-view.less'
import classnames from 'classnames'
import useTheme from '../../hooks/useTheme'
import moment from 'moment'

const LightBottomImg = require('../../static/img/topic-benefit/bg-bottom-light.png')
const DarkBottomImg = require('../../static/img/topic-benefit/bg-bottom-dark.png')
const LightBorderImg = require('../../static/img/topic-benefit/bg-border-light.png')
const DarkBorderImg = require('../../static/img/topic-benefit/bg-border-dark.png')
const StationLossImg = require('../../static/img/topic-benefit/station-icon.svg')
const ConverterLossImg = require('../../static/img/topic-benefit/converter-icon.svg')
const TransformerLossImg = require('../../static/img/topic-benefit/transformer-icon.svg')
const BatteryLossImg = require('../../static/img/topic-benefit/battery-icon.svg')
const ArrowUpImg = require('../../static/img/topic-benefit/arrow-up.png')
const ArrowDownImg = require('../../static/img/topic-benefit/arrow-down.png')

const getImage = (theme) => {
  const isLight = theme === 'light-theme'

  return {
    BorderImg: isLight ? LightBorderImg : DarkBorderImg,
    BottomImg: isLight ? LightBottomImg : DarkBottomImg,
  }
}

interface Props {
  energyUnit: any
  lossInfo: any
}

const LossView: React.FC<Props> = (props) => {
  const { lossInfo } = props
  let { theme } = useTheme()
  const { BorderImg, BottomImg } = getImage(theme)

  return (
    <div className="loss-view">
      <div className="loss-view-title">
        <DetailFormItem
          label={utils.intl('统计周期')}
          value={props.energyUnit?.productionTime ? `${moment(props.energyUnit.productionTime).format('YYYY-MM-DD')}~${moment().format('YYYY-MM-DD')}` : ''}
        />
      </div>
      <div className="loss-view-header">
        <span style={{ marginRight: 8 }}>{utils.intl('系统整体损耗')}</span>
        <span>
          <span style={{ fontSize: 18 }}>{isEmpty(lossInfo.total) ? '--' : lossInfo.total}</span>
          <span>{isEmpty(lossInfo.total) ? '' : '%'}</span>
        </span>
      </div>
      <img className="loss-view-border" src={BorderImg} />
      <div className="loss-view-info">
        <LossViewItem
          imgUrl={StationLossImg}
          label={utils.intl('站用负荷损耗')}
          value={lossInfo.station || ''}
          className="green1"
        />
        <LossViewArrow />
        <LossViewItem
          imgUrl={TransformerLossImg}
          label={utils.intl('变压器损耗')}
          value={lossInfo.transform || ''}
          className="blue1"
        />
        <LossViewArrow />
        <LossViewItem
          imgUrl={ConverterLossImg}
          label={utils.intl('变流器损耗')}
          value={lossInfo.converter || ''}
          className="green2"
        />
        <LossViewArrow />
        <LossViewItem
          imgUrl={BatteryLossImg}
          label={utils.intl('电池损耗')}
          value={lossInfo.battery || ''}
          className="blue2"
        />
      </div>
      <img className="loss-view-bottom" src={BottomImg} />
    </div>
  )
}

export default LossView

interface LossViewItemProps {
  imgUrl: string
  label: string
  value: string | number
  className?: string
}

const LossViewItem: React.FC<LossViewItemProps> = (props) => {
  return (
    <div className={classnames("loss-view-item", props.className)}>
      <img src={props.imgUrl} />
      <div className="loss-view-item-label">{props.label}</div>
      <div className="loss-view-item-value">
        <span>{isEmpty(props.value) ? '--' : props.value}</span>
        <span>{isEmpty(props.value) ? '' : '%'}</span>
      </div>
    </div>
  )
}

const LossViewArrow = () => {
  return (
    <div className="loss-view-arrow">
      <img src={ArrowDownImg} />
      <img src={ArrowUpImg} />
    </div>
  )
}

const isEmpty = (value) => {
  return value === '' || value === undefined || value === null
}
