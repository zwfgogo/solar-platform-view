import React from 'react'
import classnames from 'classnames'

interface Props {
  label: string
  className?: string
}

const DesItem: React.FC<Props> = function(this: null, props) {
  return (
    <tr className={classnames('ant-descriptions-bordered ant-descriptions-row', props.className)}>
      <th className="ant-descriptions-item-label ant-descriptions-item-colon">
        {props.label}
      </th>
      <td className="ant-descriptions-item-content">
        {props.children}
      </td>
    </tr>
  )
}

export default DesItem
