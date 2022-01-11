// 提醒设置
import React from 'react';
import CommonHeader from '../../../../components/CommonHeader';
import styles from '../styles/remind-form.less';
import { Row, Col, Form, Select } from 'wanke-gui';
import ContactItem from '../../../../components/input-item/ContactItem';
import { RemindList, RemindTimeList } from './RemindConstant';
import { MinusCircleOutlined, WankeAddOutlined } from 'wanke-icon';
import ContactFormList from './ContactFormList';
import classnames from 'classnames';
import utils from '../../../../public/js/utils';

export const RemindNoTimeMap = {
  'Finance': true,
  'NegativeElectricityPrice': true
}

const FormItem = Form.Item

interface Props {
  formData: any;
  updateFormData: (data: any) => void;
}

const RemindForm: React.FC<Props> = ({ formData, updateFormData }) => {
  const onReminderSettingsChange = (index, key, value) => {
    updateFormData({
      reminderSettings: formData.reminderSettings.map((item, remindIndex) => {
        const newItem = { ...item }
        if(remindIndex === index) {
          newItem[key] = value
        }
        return newItem
      })
    })
  }

  return (
    <section className={styles["form-container"]}>
      <CommonHeader title={utils.intl('remindForm.提醒信息')} />
      {formData.reminderSettings.map((item, index) => (
        <Row gutter={30} className={styles["body"]}>
          <Col span={6}>
            <FormItem label={item.title}>
              <Select
                dataSource={RemindList}
                value={item.breakerStatus ? 1 : 0}
                onChange={value => onReminderSettingsChange(index, 'breakerStatus', !!value)}
              />
            </FormItem>
          </Col>
          {!RemindNoTimeMap[item.name] && (
            <Col span={6}>
              <FormItem label={utils.intl('推送周期')}>
                <Select
                  disabled={!item.breakerStatus}
                  dataSource={RemindTimeList}
                  value={item.timeCycle}
                  onChange={value => onReminderSettingsChange(index, 'timeCycle', value)}
                />
              </FormItem>
            </Col>
          )}
        </Row>
      ))}
      <div className={classnames(styles["body"], "basic-border-color")}>
        <ContactFormList
          name="reminderUsers"
          list={formData.reminderSettings}
          disabledList={formData.reminderSettings.map(item => !item.breakerStatus)}
        />
      </div>
    </section>
  );
};

export default RemindForm;