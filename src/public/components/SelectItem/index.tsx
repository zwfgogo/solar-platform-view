import React from 'react'
import classnames from 'classnames'

interface ItemProps {
  className?: string;
  style?: any;
  selected?: boolean;
  disabled?: boolean;
  onClick?: Function;
  options?: any
  transformKeys?: any
  children?: any;
  activity?: string
}

function Item(props: ItemProps) {
  const {selected, className: defaultClassName, style, disabled, onClick, options, transformKeys, children} = props
  const {id, text} = transformKeys
  const idValue = options[id]
  const textValue = options[text]
  let className = defaultClassName || 'wankeitem'
  if (selected) {
    className = className + ' item-selected'
  } else if (disabled) {
    className = className + ' item-disabled'
  }


  return <span className={className} style={style} onClick={() => {
    onClick(idValue, options)
  }}>{children || textValue}</span>
}

Item.defaultProps = {
  options: {},
  transformKeys: {
    id: 'id',
    text: 'title'
  }
}
export default Item