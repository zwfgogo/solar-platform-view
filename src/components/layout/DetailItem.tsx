import React, { CSSProperties, ReactNode } from 'react'
import classnames from 'classnames'

interface Props {
  label: string | ReactNode;
  txt?: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string
  labelStyle?: CSSProperties
}

export default function DetailItem(props: Props) {
  const { style } = props
  let txt = props.txt
  if (props.txt != null && typeof props.txt == 'object') {
    txt = JSON.stringify(props.txt)
  } else if (typeof props.txt == 'object') {
  }
  const title: any = {}
  if (txt && txt.length > 40) {
    title.title = txt
  }
  const label = typeof props.label === 'string' ? props.label + '：' : props.label
  return (
    <div className={classnames('detail-item', props.className)} style={style}>
      <span className="item-label" style={props.labelStyle}>{label}</span>
      <span className="item-txt" {...title}>
        {txt || props.children}
      </span>
    </div>
  )
}
