import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import React from 'react'
import { Checkbox, Col, FullLoading, Row } from 'wanke-gui'
import styles from './styles/check-list.less'

interface CheckItem {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  value: any[]
  dataSource: CheckItem[]
  loading?: boolean
  onChange?: (checkValues: CheckboxValueType[]) => void
  totalChangeMode?: boolean
}

const CheckList: React.FC<Props> = (props) => {
  const { dataSource = [], value, totalChangeMode } = props

  const handleChange = (keys) => {
    if (totalChangeMode) {
      // 返回全部选中的keys
      const newKeys = value
        .filter(key => dataSource.every(item => item.value !== key))
        .concat(keys)
      props.onChange?.(newKeys)
    } else {
      props.onChange?.(keys)
    }
  }

  return (
    <div className={styles['check-list']} onClick={e => e.stopPropagation()}>
      {props.loading && <FullLoading></FullLoading>}
      <Checkbox.Group
        style={{ overflowX: 'hidden', width: '100%' }}
        value={props.value}
        onChange={handleChange}
      >
        <Row>
          {
            dataSource.map(item => {
              return (
                <Col span={24} title={item.label}>
                  <Checkbox
                    value={item.value}
                    disabled={item.disabled}
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}
                  >{item.label}</Checkbox>
                </Col>
              )
            })
          }
        </Row>
      </Checkbox.Group>
    </div>
  );
};

export default CheckList;