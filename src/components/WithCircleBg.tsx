import React from 'react'

interface Props {
  radius?: number
  bg?: string
  bottom?: number
}

interface State {
}

class WithCircleBg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div className="with-circle-bg" style={{borderRadius: this.props.radius, background: this.props.bg, marginBottom: this.props.bottom}}>
        {this.props.children}
      </div>
    )
  }
}

export default WithCircleBg
