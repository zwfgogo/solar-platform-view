import React from 'react'

import BasicDialog, { DialogBasicProps } from "../../../components/BasicDialog"
import ListReason from './ListReason'
import { Button, Input } from 'wanke-gui'
import { ActionProp, UpdateStateAction } from "../../../interfaces/MakeConnectProps"
import FullContainer from "../../../components/layout/FullContainer"
import { DiffState } from '../models/diff'
import Label from "../../../components/Label"
import { copy } from "../../../util/utils"
import utils from '../../../public/js/utils'

type ModelKey = 'templateCount' | 'templateQuery' | 'templateList'

/**
 * 修改密码
 */
interface Props extends DialogBasicProps, ActionProp, UpdateStateAction<DiffState> {
  editId: number
  editTitle: string
  reasonConfigList: any[]
}

class ReasonConfigDialog extends BasicDialog<Props> {
  getTitle(): string {
    return utils.intl('原因配置')
  }

  getWidth(): number {
    return 650
  }

  onOk() {

  }

  getFooter(): any {
    return null
  }

  componentDidMount() {
    this.props.action('fetchReasonConfigList')
  }

  renderBody() {
    const {editId, editTitle, reasonConfigList} = this.props
    let list = copy(reasonConfigList)
    if (editId == -1) {
      list.unshift({})
    }
    return (
      <FullContainer style={{height: 500}}>
        <div>
          <Button type="primary" onClick={() => this.props.updateState({editId: -1, editTitle: ''})}>{utils.intl('新增')}</Button>
        </div>
        <div className="flex1" style={{marginTop: 16}}>
          <ListReason dataSource={list}
                      onSave={() => this.props.action('saveReasonConfig')}
                      onCancel={() => this.props.updateState({editId: null})}
                      editId={this.props.editId}
                      editTitle={this.props.editTitle}
                      onTitleChange={v => this.props.updateState({editTitle: v})}
                      onEdit={({id, title}) => {
                        console.log('id', id)
                        this.props.updateState({editId: id, editTitle: title})
                      }}
                      onDelete={(id) => this.props.action('deleteReasonConfig', {id})}
          />
        </div>
      </FullContainer>
    )
  }
}

export default ReasonConfigDialog
