import React, {CSSProperties} from 'react'
import classnames from 'classnames'
import {connect} from 'dva'
import {getAction} from '../pages/umi.helper'
import {crumbsNS} from '../pages/constants'

let uid = 1

export function getPageId() {
  return uid++
}

interface Props {
  dispatch: any
  pageId: number
  pageTitle: string
  showStation?: boolean | ((list: any[]) => any[])
  showEnergyUnit?: boolean | ((list: any[]) => any[])
  onActivity: () => void
  onShow: () => void
  onHide: () => void
  onNeedUpdate: () => void
  className?: string
  style?: CSSProperties
  children: any
  clearBgColor?: boolean
}

class Page extends React.Component<Props> {
  static defaultProps = {
    onShow: () => null,
    onHide: () => null,
    onActivity: () => null,
    onNeedUpdate: () => null
  }

  componentDidMount(): void {
    if (this.props.pageId) {
      this.props.dispatch(getAction(crumbsNS, 'updateCrumb', {
        pageId: this.props.pageId,
        pageTitle: this.props.pageTitle,
        showStation: this.props.showStation,
        showEnergyUnit: this.props.showEnergyUnit,
        onActivity: this.props.onActivity,
        onShow: this.props.onShow,
        onHide: this.props.onHide,
        onNeedUpdate: this.props.onNeedUpdate
      }))
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.pageId != this.props.pageId) {
      console.log('bug: pageId change')
      this.props.dispatch(getAction(crumbsNS, 'removeCrumb', {pageId: prevProps.pageId}))
      this.props.dispatch(getAction(crumbsNS, 'updateCrumb', {
        pageId: this.props.pageId,
        pageTitle: this.props.pageTitle,
        showStation: this.props.showStation,
        showEnergyUnit: this.props.showEnergyUnit,
        onActivity: this.props.onActivity,
        onShow: this.props.onShow,
        onHide: this.props.onHide,
        onNeedUpdate: this.props.onNeedUpdate
      }))
    } else {
      this.props.dispatch(getAction(crumbsNS, 'updateCrumb', {
        pageId: this.props.pageId,
        pageTitle: this.props.pageTitle,
        showStation: this.props.showStation,
        showEnergyUnit: this.props.showEnergyUnit,
        onActivity: this.props.onActivity,
        onShow: this.props.onShow,
        onHide: this.props.onHide,
        onNeedUpdate: this.props.onNeedUpdate
      }))
    }
  }

  render() {
    return (
      <div className={classnames('page', { 'page-bg2': this.props.clearBgColor }, this.props.className)} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export default connect<any, any, any, any>(null)(Page)
