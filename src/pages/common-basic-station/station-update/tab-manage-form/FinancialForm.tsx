// 财务信息
import React, { useState } from 'react';
import CommonHeader from '../../../../components/CommonHeader';
import CheckboxGroup from '../../../../components/input-item/CheckboxGroup';
import { FinancialList } from './financialConstant';
import styles from '../styles/financial-form.less';
import { Row, Col, Form, RangePicker, DatePicker } from 'wanke-gui';
import moment, { Moment } from 'moment';
import { disabledDateAfterToday, disabledDateBeforeToday, disabledDateBeforeTomorrow } from '../../../../util/dateUtil';
import classnames from 'classnames';
import utils from '../../../../public/js/utils';

const FormItem = Form.Item

interface FormItemLabelProps {
  title: string;
  endTime?: Moment;
}

export const FormItemLabel: React.FC<FormItemLabelProps> = ({ title, endTime }) => {
  let time = endTime
  if(endTime) {
    time = moment(time)
  }
  let showRemind = false;
  if (time && !time.isAfter(moment().add(1, 'month').startOf('day')) && !time.isBefore(moment().startOf('day'))) {
    showRemind = true;
  }
  
  return (
    <span>{title}：{showRemind && <span className="remind-font-color" style={{ whiteSpace: 'nowrap' }}>({utils.intl('即将到期')})</span>}</span>
  );
}

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
  financialType: any[];
}

const FinancialForm: React.FC<Props> = ({ formData, updateFormData, financialType }) => {
  const handleTimeChange = (name, value) => {
    updateFormData({
      [name]: value
    })
  }

  const onCheckChange = (checkList) => {
    updateFormData({ checkList })
  }

  const handleDisabledDate = (current: Moment, type: 'start' | 'end') => {
    return type === 'end' && disabledDateBeforeTomorrow(current);
  }

  return (
    <section className={classnames(styles["form-container"], "basic-border-color")}>
      <CommonHeader title={utils.intl('financialForm.财务信息')} />
      <Row className={styles["body"]} gutter={30}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <CheckboxGroup
            list={financialType.map(item => ({ name: item.title, value: item.id }))}
            onChange={onCheckChange}
            value={formData.checkList}
          />
        </Col>
        {financialType
          .filter(item => formData.checkList.indexOf(item.id) > -1)
          .map(item => (
            <Col span={6}>
              {item.type === 'RangePicker' ? (
                <FormItem
                  label={<FormItemLabel title={item.title} endTime={formData[item.name]?.[1]} />}
                  colon={false}
                >
                  <RangePicker
                    onChange={value => handleTimeChange(item.name, value)}
                    value={formData[item.name]}
                    disabledDate={handleDisabledDate}
                  />
                </FormItem>
              ) : (
                <FormItem label={item.title}>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={formData[item.name]}
                    onChange={value => handleTimeChange(item.name, value)}
                    disabledDate={current => disabledDateAfterToday(current)}
                  />
                </FormItem>
              )}
            </Col>
          ))
        }
      </Row>
    </section>
  );
};

export default FinancialForm;
