import React from 'react'

import BasicDialog, {DialogBasicProps} from '../../../../components/BasicDialog'
import SearchBox from '../../../../components/layout/SearchBox'
import ListTemplate from './ListTemplate'
import {ActionProp, UpdateAction} from '../../../../interfaces/MakeConnectProps'
import {OptimizeRunningUpdateModel} from '../../models/update'
import {message} from 'wanke-gui'

import utils from '../../../../public/js/utils'

type ModelKey = 'templateCount' | 'templateQuery' | 'templateList'

/**
 * 修改密码
 */
interface Props extends DialogBasicProps, UpdateAction<OptimizeRunningUpdateModel>, ActionProp, Pick<OptimizeRunningUpdateModel, ModelKey> {
  loading: boolean
}

class TemplateDialog extends BasicDialog<Props> {
  state = {
    currentTemplate: []
  }

  getTitle(): string {
    return utils.intl('选择模板')
  }

  getWidth(): number {
    return 650
  }

  onPageChange = (page, size) => {
    this.props.updateQuery({page, size}, 'templateQuery')
    this.props.action('fetchTemplateList')
  }

  onSearch = () => {
    this.props.updateQuery({page: 1}, 'templateQuery')
    this.props.action('fetchTemplateList')
  }

  onOk() {
    if (this.state.currentTemplate.length == 0) {
      message.error('请选择模板')
      return
    }
    const id = this.state.currentTemplate[0]
    let info = this.props.templateList.find(item => item.id == id).runStrategyTemplateDetails || []
    this.props.action('useTemplate', {templateInfo: info})
  }

  componentDidMount() {
    this.props.action('fetchTemplateList')
  }

  renderBody() {
    const {templateList, templateQuery, templateCount} = this.props
    return (
      <div>
        <SearchBox searchKey={templateQuery.queryStr}
                   onChange={v => this.props.updateQuery({queryStr: v}, 'templateQuery')}
                   onSearch={this.onSearch}
        />
        <div style={{height: 300}}>
          <ListTemplate
            loading={this.props.loading}
            checkedList={this.state.currentTemplate}
            onCheckChange={v => this.setState({currentTemplate: v})}
            dataSource={templateList}
            size={templateQuery.size}
            page={templateQuery.page}
            onPageChange={this.onPageChange}
            total={templateCount}
          />
        </div>
      </div>
    )
  }
}

export default TemplateDialog
