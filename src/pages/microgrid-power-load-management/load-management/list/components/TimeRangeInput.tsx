import React, { useEffect, useState } from 'react'
import { Col, Form, Row, TimePicker } from 'wanke-gui'
import { MinusCircleOutlined, PlusOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './styles/time-range-input.less'
import { FormInstance } from 'antd/lib/form'
import utils from '../../../../../public/js/utils'

const { Item: FormItem } = Form

interface Props {
  name: string
  form: FormInstance
}

const TimeRangeInput: React.FC<Props> = ({ name, form }) => {
  const getValidatorTime = (index) => {
    return (rule, value) => {
      if (!value) return Promise.reject(utils.intl('请选择时间'));
      if (!value.startTime) return Promise.reject(utils.intl('请选择开始时间'));
      if (!value.endTime) return Promise.reject(utils.intl('请选择结束时间'));

      const formater = "HH"
      let startStr = value.startTime.format(formater)
      let endStr = value.endTime.format(formater)
      if (endStr === '00') endStr = '24'

      if (startStr < endStr) {
        return Promise.resolve();
      }

      return Promise.reject(utils.intl('计划开始时间不能晚于计划结束时间'));
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
                  <FormItem
                    name={[field.name]}
                    rules={[
                      { validator: getValidatorTime(index) },
                    ]}
                  >
                    <TimeRangeLine>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className={classnames(styles["icon-delete"])}
                          onClick={() => { remove(field.name) }}
                        />
                      ) : null}
                    </TimeRangeLine>
                  </FormItem>
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

const TimeRangeLine = (props) => {
  const [value, setValue] = useState(props.value)

  useEffect(() => {
    if (value !== props.value) {
      setValue(props.value)
    }
  }, [props.value])

  const triggerChange = (value) => {
    setValue(value)
    props.onChange?.(value)
  }

  const handleChange = (attr, val) => {
    const newValue = {
      ...value,
      [attr]: val
    }
    triggerChange(newValue)
  }

  return (
    <div className={styles['range-line']}>
      <TimePicker
        className={styles['picker']}
        format='HH:00'
        showNow={false}
        allowClear={false}
        value={value?.startTime}
        onChange={val => handleChange('startTime', val)}
      />
      <span className={styles['split']}>~</span>
      <TimePicker
        className={styles['picker']}
        format='HH:00'
        showNow={false}
        allowClear={false}
        value={value?.endTime}
        onChange={val => handleChange('endTime', val)}
      />
      {props.children}
    </div>
  )
}
