import React from 'react'
import {Button} from 'wanke-gui'

interface Props {
  onClick: () => void
}

class AddButton extends React.Component<Props> {
  render() {
    return (
      <Button type="primary" onClick={this.props.onClick}>{this.props.children}</Button>
    )
  }
}

export default AddButton
