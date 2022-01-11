import React, { useEffect } from 'react';
import { Form, Input, Checkbox } from 'wanke-gui';
import { FormProps } from 'antd/lib/form';
import FormItemUnit from '../../../../components/FormItemUnit';

import Area from '../../../../components/Area';
import utils from '../../../../public/js/utils';
import { connect } from 'dva';
import { FormContainer } from '../../../../components/input-item/InputItem'

export interface SeasonProps extends FormProps {
    dispatch: any;
    volType?: Array<any>;
    voltageLevels?: Array<any>;
    provinceId;
    cityId;
    districtId;
    selectNation: any;
    detail: any;
    id:any;
}

const FormItem = Form.Item;

class Base extends React.Component<SeasonProps> {
    componentDidMount() {
        const { dispatch, form } = this.props;
        dispatch({
            type: 'priceEdit/addForm',
            payload: {
                base: form,
            },
        });
    }
    render() {
        const { detail, dispatch, form, volType, id } = this.props;
        const { title, property, voltageLevelsIds, province, city, district, country } = detail;
        const selectNation = (arr, e) => {
            this.props.selectNation(arr, e)
        }
        return (
            <Form
                initialValues={{
                    title: title || '',
                    property: property || '',
                    area: { values: [country ?.id || '', province ? province.id : '', city ? city.id : '', district ? district.id : ''], isSelected: id ? true : false },
                    voltageLevels: voltageLevelsIds || []
                }}
                form={this.props.form}
                layout={'vertical'}
                autoComplete={'off'}>
                <FormItemUnit>
                    <FormItem
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: utils.intl('必填'),
                            },
                            {
                                whitespace: true,
                                message: utils.intl('必填'),
                            },
                            {
                                max: 32,
                                message: utils.intl('32个字符以内'),
                            },
                        ]}
                        label={utils.intl('电价名称')}><Input /></FormItem>
                </FormItemUnit>
                <FormItemUnit>
                    <FormItem
                        name="property"
                        rules={[
                            {
                                max: 16,
                                message: utils.intl('16个字符以内'),
                            },
                        ]}
                        label={utils.intl('用电性质')}><Input /></FormItem>
                </FormItemUnit>
                <FormItemUnit style={{ marginRight: 0, width: '650px' }}>
                    <FormItem
                        name="area"
                        rules={[
                            {
                                required: true,
                            },
                            {
                                validator: function (rule, value, callback) {
                                    if (value.isSelected) {
                                        callback();
                                    } else {
                                        callback(utils.intl('请输入完整的地址'));
                                    }
                                },
                            },
                        ]}
                        label={utils.intl('适用地区')}><Area selectNation={selectNation} nationWidth={101} width={101} exact={false} /></FormItem>
                </FormItemUnit>
                <FormItem name="voltageLevels" label={utils.intl('适用电压等级')} className="row"><Checkbox.Group options={volType} /></FormItem>
            </Form>
        );
    }
}
const BaseForm = FormContainer.create()(Base);

function mapStateToProps(state) {
    return {
        ...state.priceEdit,
    };
}
export default connect(mapStateToProps)(BaseForm);