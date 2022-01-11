/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, {useState} from 'react';
import {Input, Row, Col, Form, Checkbox, Modal} from 'wanke-gui';
import {connect} from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'

const FormItem = Form.Item;

const _Form = props => {
    const {dispatch, vppModal, record,modalTitle,detail,fromLoading} = props;
    console.log(props)
    const [maxPower,setMaxPower] = useState(false);
    const cancel = () => {
        dispatch({
            type: 'vppMonitor/updateState',
            payload: {
                vppModal: false,outType:'',inType:''
            },
        });
    };
    const onChange = (e) => {
        setMaxPower(e.target.checked);
        if(modalTitle === '输出调度指令') {
            setFieldsValue({power:Math.abs(detail.exportPower.value).toString()})
        }else {
            setFieldsValue({power:Math.abs(detail.importPower.value).toString()})
        }
    };

    const {setFieldsValue} = props.form;
    const formItemLayout = {
        wrapperCol: {span: 23},
    };
    async function handleSubmit(e) {
        e.preventDefault();
        props.form.validateFields().then((values) => {
                if(modalTitle === '输出调度指令'){
                    dispatch({
                        type: 'vppMonitor/dispatchVpp',
                        payload: {
                            actionNumber:2,values
                        },
                    });
                }else {
                    dispatch({
                        type: 'vppMonitor/dispatchVpp',
                        payload: {
                            actionNumber:1,values
                        },
                    });
                }
        });
    }
    return (
        <Modal centered maskClosable={false} bodyStyle={{color: 'white'}} width={'530px'} visible={vppModal}
               title={modalTitle} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'} okText={'下发'}
               confirmLoading={fromLoading}
        >
            <div style={{paddingLeft: '90px'}}>
                <Form
                    initialValues={{
                        power: record.power || ''
                    }}
                    form={props.form}
                    layout={'vertical'}
                    autoComplete="off">
                    <Row>
                        <span style={{position:'relative',top:'40px',marginRight:'0.5em',float:'left'}}>{modalTitle === '输入调度指令'? '-' : ''}</span>
                        <Col span={16}>
                            <FormItem
                                name="power"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入调度功率',
                                    },
                                    {
                                        validator: function(rule, value, callback) {
                                            if(modalTitle === '输出调度指令') {
                                                if(value > detail.exportPower.value){
                                                    callback('不得超过可用输出功率');
                                                }else if(value <= 0){
                                                    callback('调度功率必须大于0');
                                                }else{
                                                    callback();
                                                }
                                            }else {
                                                if(value > Math.abs(detail.importPower.value)){
                                                    callback('不得超过可用输入功率');
                                                }else if(value <= 0){
                                                    callback('调度功率必须大于0');
                                                }else{
                                                    callback();
                                                }
                                            }
                                        },
                                    },

                                ]}
                                {...formItemLayout}
                                label={`调度功率：`}><Input disabled={maxPower} autoComplete="off"/></FormItem>
                        </Col>
                        <span style={{position:'relative',top:'40px',marginRight:'0.5em'}}>kW</span>
                        <Checkbox onChange={onChange} style={{position:'relative',top:'40px'}}>最大功率</Checkbox>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
};

//绑定layout model ，获取title
function mapStateToProps(state) {
    return {
        ...state.vppMonitor,fromLoading: state.loading.effects['vppMonitor/dispatchVpp']
    };
}

const _FormRes = FormContainer.create()(_Form);
export default connect(mapStateToProps)(_FormRes);