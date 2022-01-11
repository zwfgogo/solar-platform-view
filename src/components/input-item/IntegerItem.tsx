import React from 'react'

import {BasicProps} from './types'
import NumberItem from './NumberItem'

/**
 * 受控的数字框组件
 */
interface Props extends BasicProps {
  placeholder?: string
  value: number
  onChange: (v) => void
  suffix?: string
}

class IntegerItem extends React.Component<Props> {
  render() {
    return (
      <NumberItem {...this.props} onChange={this.props.onChange} min={1} precision={0}/>
    )
  }
}

export default IntegerItem
