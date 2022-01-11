import React from 'react'
import {connect} from 'dva'

export interface NavigateProps {
  back: (count?: number) => void
  forward: (name: string, data: Record<any, any>, title?: string) => void
  replace: (name: string, data: Record<any, any>, title?: string) => void
}

function navigateHoc<T = any>(Component) {
  class Navigate extends React.Component<any> {
    back = (count = 1) => {
      if (typeof count != 'number') {
        count = 1
      }
      this.props.dispatch({type: 'crumbs/updateCrumbs', payload: {type: 'back', count}})
    }
    forward = (name, data) => {
      this.props.dispatch({type: 'crumbs/addCrumb', payload: {data, pageName: name}})
    }
    replace = (name, data) => {
      this.props.dispatch({type: 'crumbs/updateCrumbs', payload: {type: 'back', count: 1}})
      this.props.dispatch({type: 'crumbs/addCrumb', payload: {data, pageName: name}})
    }

    render() {
      return (
        <Component {...this.props} back={this.back} forward={this.forward} replace={this.replace}/>
      )
    }
  }

  return connect<any, any, any, any>(state => ({}))(Navigate)
}

export default navigateHoc
