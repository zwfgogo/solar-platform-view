import React from 'react'
import {Button} from 'wanke-gui'
import Footer from './Footer'

interface Props {
  onCancel: () => void
  onEdit: () => void
}

class CancelAndUpdate extends React.Component<Props> {
  render() {
    return (
      <Footer>
        <Button onClick={this.props.onCancel}>取消</Button>
        <Button type="primary" style={{marginLeft: 10}} onClick={this.props.onEdit}>编辑</Button>
      </Footer>
    )
  }
}

export default CancelAndUpdate
