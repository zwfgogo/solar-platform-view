import React from 'react'
import Des from '../../components/layout/Des'

interface Props {
  children: any[]
}

interface State {
}

class StrategyTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    let {children} = this.props
    return (
      <Des>
        {children}
      </Des>
    )
  }
}

export default StrategyTab
