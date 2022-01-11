import React, {FC} from 'react'
import {connect} from 'dva'
import navigateHoc, {NavigateProps} from '../navigateHoc'
import {getAction} from '../../pages/umi.helper'
import {crumbsNS} from '../../pages/constants'

interface FlowProps {
  pageId?: number
  pageName?: string
  destroyedOnForward?: boolean
  component?: any
  default?: boolean
  data?: any
}

interface FlowInnerProps extends FlowProps, NavigateProps {
  dispatch?: any
  data?: any
  crumbs?: Array<any>
}

class FlowInner extends React.Component<FlowInnerProps> {
  componentDidMount(): void {
    if (this.props.default) {
      this.updateCrumbs()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.default && !prevProps.pageId) {
      this.updateCrumbs()
    }
  }

  updateCrumbs = () => {
    if (!this.props.pageId) {
      // console.log('default Flow 缺少pageId')
      return
    }
    this.props.dispatch(getAction(crumbsNS, 'updateCrumb', {
      pageId: this.props.pageId,
      pageName: this.props.pageName,
      data: this.props.data
    }))
  }

  parentPageNeedUpdate = (pageId, type, data) => {
    this.props.dispatch({
      type: 'crumbs/updateCrumb', payload: {
        pageId: pageId,
        needUpdate: true,
        updateType: type,
        updateData: data
      }
    })
  }

  render() {
    let {crumbs = [], pageName, destroyedOnForward, component} = this.props
    if (crumbs.length == 0) {
      return null
    }
    const lastCrumb = crumbs[crumbs.length - 1]
    let Component = component
    let match = crumbs.find(crumb => crumb.pageName == pageName)

    if (!match) {
      return null
    }
    let data = match.data || {}

    const children = <Component {...data}
                                pageId={match.pageId}
                                parentPageNeedUpdate={(type, data) => this.parentPageNeedUpdate(match.pageId, type, data)}
                                back={this.props.back}
                                forward={this.props.forward}
                                replace={this.props.replace}
    />

    if (lastCrumb.pageName === pageName) {
      return children
    } else if (!destroyedOnForward) {
      return children
    }
    return null
  }
}

const Flow: FC<FlowProps> = connect<any, any, any, any>(state => {
  return {
    crumbs: state.crumbs.crumbs,
    language: state.global.language
  }
})(navigateHoc(FlowInner))

export default Flow
