import { Result } from 'antd'
import React, { Component } from 'react'
import { FullContainer } from 'wanke-gui'
import { FrownOutlined } from 'wanke-icon'
import utils from '../public/js/utils'

interface Props {
  pathname: string
  crumbs: any[]
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true })
    console.log(info)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.pathname !== this.props.pathname ||
      prevProps.crumbs?.length !== this.props.crumbs?.length
    ) {
      this.setState({ hasError: false })
    }
  }
  
  render() {
    if(this.state.hasError) {
      return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            icon={<FrownOutlined />}
            title={utils.intl('页面好像出错了')}
          />
        </div>
      )
    }
    return (
      <>
        {this.props.children}
      </>
    )
  }
}

export default ErrorBoundary