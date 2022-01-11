import React from 'react'
import { CaretLeftOutlined, CaretRightOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './styles/toggle-button.less'

interface Props {
  style?: React.CSSProperties
  toLeft?: boolean
  onClick?: () => void
}

const ToggleButton: React.FC<Props> = (props) => {
  return (
    <div
      className={classnames(styles['toggle-btn'], props.toLeft ? styles['to-left'] : styles['to-right'])}
      style={props.style} onClick={props.onClick}
    >
      {props.toLeft ? <CaretLeftOutlined /> : <CaretRightOutlined />}
    </div>
  );
};

export default ToggleButton;