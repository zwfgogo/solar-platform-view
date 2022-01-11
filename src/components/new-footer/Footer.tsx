import React from 'react'
import {} from 'wanke-gui'

interface Props {
}

class Footer extends React.Component<Props> {
  state = {}

  render() {
    return (
      <div className="footer">
        {this.props.children}
      </div>
    )
  }
}

export default Footer
