import React from 'react'
import { FormComponentProps } from "../../../interfaces/CommonInterface"
import BasicDialog, {DialogBasicProps} from "../../../components/BasicDialog"
import {FormContainer} from "../../../components/input-item/InputItem"
import DateItem from "../../../components/input-item/DateItem"
import TextItem from "../../../components/input-item/TextItem"
import {Moment} from 'moment'
import {inputLengthRule} from "../../../util/ruleUtil"
import moment from 'moment'

/**
 *
 */
interface Props extends DialogBasicProps, FormComponentProps {
    updateState: (state) => void
    processer: string
    endTime: Moment
    acceptor: string
    director: string
    updateBug: () => void
    startTime: Moment
}

class UpdateBugDialog extends BasicDialog<Props> {
    getTitle(): string {
        return '消除缺陷'
    }

    getWidth(): number {
        return 700
    }

    onOk() {
        this.props.form.validateFields().then(() => {
                this.props.updateBug()
        })
    }

    disabledDate = (current) => {
        const {startTime} = this.props
        let d = new Date()
        let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
        return current < moment(startTime, 'YYYY-MM-DD').startOf('day') || current > moment(date, 'YYYY-MM-DD').endOf('day')
    }

    renderBody() {
        const {processer, endTime, acceptor, director} = this.props
        const {updateState} = this.props
        return (
            
            <div>
                
                <FormContainer form={this.props.form} >
                    <div className="d-flex" style={{flexWrap: 'wrap'}}>
                        <TextItem
                            label="消除人" rules={[{required: true}, inputLengthRule(16)]} disabled
                            value={processer} onChange={v => updateState({processer: v})}
                        />
                        <DateItem label="消除日期" rules={[{required: true}]} disabledDate={this.disabledDate}
                                  value={endTime} onChange={v => updateState({endTime: v})}
                        />
                        <TextItem label="验收人" rules={[{required: true}, inputLengthRule(16)]}
                                  value={acceptor} onChange={v => updateState({acceptor: v})}
                        />
                        <TextItem label="负责人" rules={[{required: true}, inputLengthRule(16)]}
                                  value={director} onChange={v => updateState({director: v})}
                        />
                    </div>
                </FormContainer>
            </div>
        )
    }
}

export default FormContainer.create<Props>()(UpdateBugDialog)
