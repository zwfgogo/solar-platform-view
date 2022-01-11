import React, { CSSProperties } from 'react'
import classnames from 'classnames'

interface Props {
  style?: CSSProperties
  className?: string
}

class FullContainer extends React.Component<Props, {}> {
  render() {
    return (
      <div className={classnames('full-container', this.props.className)} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export default FullContainer
