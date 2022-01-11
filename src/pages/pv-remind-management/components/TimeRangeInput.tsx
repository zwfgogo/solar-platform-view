import React, { useState } from 'react'
import { Col, Form, Row, TimePicker } from 'wanke-gui'
import { MinusCircleOutlined, PlusOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './styles/time-range-input.less'
import { FormInstance } from 'antd/lib/form'
import utils from '../../../public/js/utils'

const { Item: FormItem } = Form

interface Props {
  name: string
  form: FormInstance
}

const TimeRangeInput: React.FC<Props> = ({ name, form }) => {
  const [errorMsg, setErrorMsg] = useState({})

  const getValidatorTime = (targetKey, index, isEndTime) => {
    return (rule, value) => {
      const targetValue = form.getFieldValue(name)[index]?.[targetKey]
      if (!value || !targetValue) {
        errorMsg[index] = ''
        setErrorMsg({...errorMsg})
        return Promise.resolve();
      }

      const formater = "HH"
      let valueStr = value.format(formater)
      if (isEndTime && valueStr === '00') valueStr = '24'
      let targetStr = targetValue.format(formater)
      if (!isEndTime && targetStr === '00') targetStr = '24'

      if ((valueStr > targetStr && isEndTime) || (valueStr < targetStr && !isEndTime)) {
        errorMsg[index] = ''
        setErrorMsg({...errorMsg})
        return Promise.resolve();
      }
      errorMsg[index] = utils.intl('remind.开始时间不能晚于结束时间')
      setErrorMsg({...errorMsg})
      return Promise.reject(' ');
    }
  }

  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => {
        return (
          <section className={styles['time-range-input']}>
            <header>
              {
                fields.map((field, index) => (
                  <div className={styles['range-line']}>
                    <FormItem
                      className={styles['picker']}
                      name={[field.name, 'startTime']}
                      rules={[
                        { required: true, message: utils.intl('remind.请选择开始时间') },
                        { validator: getValidatorTime('endTime', index, false) },
                      ]}
                    >
                      <TimePicker format='HH:00' showNow={false} allowClear={false} style={{ width: '100%' }} />
                    </FormItem>
                    <span className={styles['split']}>~</span>
                    <FormItem
                      className={styles['picker']}
                      name={[field.name, 'endTime']}
                      rules={[
                        { required: true, message: utils.intl('remind.请选择结束时间') },
                        { validator: getValidatorTime('startTime', index, true) },
                      ]}
                    >
                      <TimePicker format='HH:00' showNow={false} allowClear={false} style={{ width: '100%' }} />
                    </FormItem>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className={classnames(styles["icon-delete"])}
                        onClick={() => { remove(field.name) }}
                      />
                    ) : null}
                    {errorMsg[index] && <div className={styles['error-message']}>{errorMsg[index]}</div>}
                  </div>
                ))
              }
            </header>
            <footer className={styles['add-btn']} onClick={() => { add() }}>
              <PlusOutlined /><span>{utils.intl('新增')}</span>
            </footer>
          </section>
        )
      }}
    </Form.List>
  )
}

export default TimeRangeInput