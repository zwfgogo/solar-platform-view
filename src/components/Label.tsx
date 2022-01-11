import React, { CSSProperties } from 'react'
import classnames from 'classnames'

interface Props {
  required?: boolean
  style?: CSSProperties
  horizontal?: boolean
  className?: string
}

class Label extends React.Component<Props> {
  render() {
    return (
      <div
        className={classnames(this.props.className, 'ant-form-item-label', {
          'horizontal': this.props.horizontal
        })}
        style={this.props.style}>
        <label className={classnames({'ant-form-item-required': this.props.required})}>
          {this.props.children}
        </label>
      </div>
    )
  }
}

export default Label
