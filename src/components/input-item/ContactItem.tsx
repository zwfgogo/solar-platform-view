import React from 'react';
import { Form, Input, Row, Col } from 'wanke-gui';
import styles from './styles/contact-item.less'
import utils from '../../public/js/utils';

const FormItem = Form.Item

interface ContactItemValue {
  title?: string;
  phone?: string;
  email?: string;
}

interface Props {
  value?: ContactItemValue;
  onChange?: any;
  hideLabel?: boolean;
}

const ContactItem: React.FC<Props> = ({ value = {}, onChange, hideLabel }) => {

  const triggerChange = (key, changedValue) => {
    if (onChange) {
      onChange({ ...value, [key]: changedValue });
    }
  };

  return (
    <section className={styles["contact-item"]}>
      <div className={styles["contact-item-cell"]}>
        <FormItem label={hideLabel ? undefined : utils.intl('contactItem.联系人')}>
          <Input value={value.title} onChange={(e) => triggerChange('title', e.target.value)} />
        </FormItem>
      </div>
      <div className={styles["contact-item-cell"]}>
        <FormItem label={hideLabel ? undefined : utils.intl('contactItem.联系电话')}>
          <Input value={value.phone} onChange={(e) => triggerChange('phone', e.target.value)} />
        </FormItem>
      </div>
      <div className={styles["contact-item-cell"]}>
        <FormItem label={hideLabel ? undefined : utils.intl('contactItem.邮箱')}>
          <Input value={value.email} onChange={(e) => triggerChange('email', e.target.value)} />
        </FormItem>
      </div>
    </section>
  );
};

export default ContactItem;