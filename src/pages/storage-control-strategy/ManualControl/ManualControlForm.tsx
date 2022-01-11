import React, { Component } from 'react';
import { Form } from 'antd'
import { FormInstance } from 'antd/lib/form';
import { getManualFormJson } from '../dataCfg';
import _ from 'lodash'
import moment from 'moment';

export interface ManualControlFormProps{
  type: 1|2
  orderMap: any[], 
  socMap: any[], 
  controlMap: any[],
  record: any
  tableList: any[]
}

interface ManualControlFormState{
  formJson: any[]
}

class ManualControlForm extends Component<ManualControlFormProps, ManualControlFormState> {
  formRef: FormInstance<any>;

  constructor(props){
    super(props)
    this.state = {
      formJson: []
    }
  }

  componentDidMount(){
    const { type, orderMap, socMap, controlMap, tableList } = this.props
    this.setState({ formJson: getManualFormJson(type, this.formRef, {orderMap, socMap, controlMap, tableList}) })
  }

  componentDidUpdate(preProps){
    if(this.props.type !== preProps.type){
      const { type, orderMap, socMap, controlMap, tableList } = this.props
      this.setState({ formJson: getManualFormJson(type, this.formRef, {orderMap, socMap, controlMap, tableList}) })
    }

    if(!_.isEqual(this.props.tableList, preProps.tableList)){
      const { type, orderMap, socMap, controlMap, tableList } = this.props
      this.setState({ formJson: getManualFormJson(type, this.formRef, {orderMap, socMap, controlMap, tableList}) })
    }
  }

  render() {
    const { type, record } = this.props
    const { formJson } = this.state

    return (
      <div>
        <Form
            ref={form => this.formRef = form}
            layout={type === 1 ? 'horizontal' : "vertical"}
            initialValues={{
              ...record,
              startTime: record?.startTime ? moment(record.startTime, 'HH:mm:ss') : undefined,
              endTime: record?.endTime ?  moment(record.endTime, 'HH:mm:ss') : undefined,
            }}
          >
            {
              formJson.map(item => (
                <Form.Item name={item.name} label={item.title} rules={item.rules} shouldUpdate={item.shouldUpdate} noStyle={item.noStyle}>
                  {item.component}
                </Form.Item>
              ))
            }
          </Form>
      </div>
    );
  }
}

export default ManualControlForm;
