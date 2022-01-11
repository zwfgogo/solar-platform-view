import React from 'react'
import {Button} from 'wanke-gui'
import Footer from './Footer'

interface Props {
  loading: boolean
  onCancel: () => void
  onSave: () => void
}

class CancelAndSave extends React.Component<Props> {

  render() {
    return (
      <Footer>
        <Button onClick={this.props.onCancel}>取消</Button>
        <Button type="primary" style={{marginLeft: 10}}
                loading={this.props.loading}
                onClick={this.props.onSave}>保存</Button>
      </Footer>
    )
  }
}

export default CancelAndSave
