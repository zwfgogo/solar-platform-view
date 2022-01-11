import React from 'react';
import { Form, Row, Col } from 'wanke-gui';
import ContactItem from '../../../../components/input-item/ContactItem';
import { MinusCircleOutlined, WankeAddOutlined } from 'wanke-icon';
import styles from '../styles/contact-form-list.less';
import classnames from 'classnames';
import CheckboxGroup from '../../../../components/input-item/CheckboxGroup';

const FormItem = Form.Item

interface Props {
  name: string;
  list: any[];
  disabledList: boolean[];
}

const ContactFormList: React.FC<Props> = ({ name, list, disabledList = [] }) => {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => {
        return (
          <div>
            {
              fields.map((field, index) => (
                <Row className={styles["contact-form-line"]} gutter={30}>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className={classnames(styles["icon"], styles["icon-delete"], "basic-icon-delete")}
                      onClick={() => { remove(field.name) }}
                    />
                  ) : null}
                  <Col span={12} className={styles["contact-form-line-left"]}>
                    <div className={styles["contact-form-item"]}>
                      <FormItem name={[field.name]}>
                        <ContactItem hideLabel={index > 0} />
                      </FormItem>
                    </div>
                    <aside className={styles["contact-form-menu"]}>
                      {fields.length === index + 1 ? (
                        <WankeAddOutlined
                          className={classnames(styles["icon"], styles["icon-add"], "basic-icon-add")}
                          onClick={() => { add() }}
                        />
                      ) : null}
                    </aside>
                  </Col>
                  <Col span={12} className={styles["remind-list"]}>
                    <FormItem name={[field.name, "reminderSettingIds"]}>
                      <CheckboxGroup
                        list={list.map((item, index) => ({
                          name: item.title,
                          value: item.id,
                          disabled: disabledList[index]
                        }))}
                      />
                    </FormItem>
                  </Col>
                </Row>
              ))
            }
          </div>
        )
      }}
    </Form.List>
  );
};

export default ContactFormList;