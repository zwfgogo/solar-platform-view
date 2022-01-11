import React from 'react'
import { Checkbox } from 'wanke-gui'
import styles from './styles/checkbox-group.less'
import { CheckboxGroupProps } from 'antd/lib/checkbox/Group'

interface List {
  value: any
  name: string
  disabled?: boolean
  [key: string]: any
}

interface Props extends CheckboxGroupProps {
  list: List[]
}

const CheckboxGroup: React.FC<Props> = ({ list = [], ...restProps }) => {
  return (
    <Checkbox.Group style={{ width: '100%' }} {...restProps}>
      <ul className={styles['list']}>
        {list.map((item, index) => (
          <li className={styles['item']}>
            <Checkbox value={item.value} key={index} disabled={item.disabled}>
              {item.name}
            </Checkbox>
          </li>
        ))}
      </ul>
    </Checkbox.Group>
  )
}

export default CheckboxGroup;