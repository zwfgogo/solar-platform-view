// 单位信息
import React from 'react';
import { Col, Row } from 'wanke-gui';
import CommonHeader from '../../../../components/CommonHeader';
import SelectItem from '../../../../components/input-item/SelectItem';
import { ValueName } from '../../../../interfaces/CommonInterface';
import utils from '../../../../public/js/utils';
import styles from '../styles/firm-info-form.less';
import classnames from 'classnames';

interface Props {
  formData: any
  userOption1: ValueName[]
  userOption2: ValueName[]
  userOption3: ValueName[]
  updateFormData: (data: any) => void
}

const FirmInfoForm: React.FC<Props> = ({ formData, updateFormData, userOption1, userOption2, userOption3 }) => {
  return (
    <section className={classnames(styles["form-container"], "basic-border-color")}>
      <CommonHeader title={utils.intl('tabManageLook.单位信息')} />
      <Row gutter={30} className={styles["body"]}>
        <Col span={6}>
          <SelectItem
            label={utils.intl("电站运营商")} rules={[{ required: true }]} dataSource={userOption1}
            value={formData.user1} onChange={value => updateFormData({ user1: value })}
          />
        </Col>
        <Col span={6}>
          <SelectItem
            label={utils.intl("电站运维商")} rules={[]} dataSource={userOption2}
            value={formData.user2} onChange={value => updateFormData({ user2: value })}
          />
        </Col>
        <Col span={6}>
          <SelectItem
            label={utils.intl("电站终端用户")} rules={[]} dataSource={userOption3}
            value={formData.user3} onChange={value => updateFormData({ user3: value })}
          />
        </Col>
      </Row>
    </section>
  );
};

export default FirmInfoForm;