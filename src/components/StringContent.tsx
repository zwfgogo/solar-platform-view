import React from 'react'

interface Props {
  content: string
  maxLength: number
}

const StringContent: React.FC<Props> = function (this: null, props) {
  if (props.content == undefined) {
    return null
  }
  if (props.content.length <= props.maxLength) {
    return (
      <span>{props.content}</span>
    )
  }
  return (
    <span title={props.content}>
      {props.content.substr(0, props.maxLength) + '...'}
    </span>
  )
}

export default StringContent
