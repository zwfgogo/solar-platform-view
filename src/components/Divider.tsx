/** 分割线 */
import React, { Component, CSSProperties } from 'react'
import classNames from 'classnames'
import "./style/divider.less"

interface Props {
  type: "edit" | "view",
  style?: CSSProperties
}
interface State {
  
}

export default class Divider extends Component<Props, State> {
  
  static defaultProps : Partial<Props> = {
    type: 'view'
  }

  render() {
    const { type, style } = this.props
    return (
      <div className={classNames("divider-box",`divider-box-${type}`)} style={style}>
        <div className="divider"></div>
      </div>
    )
  }
}
