import React from 'react'
import { CommandType } from '..'
import BreakCommand from './BreakCommand'
import './command-dialog.less'

interface Props {
  type: CommandType
  args: string[]
  onClose: () => void
}

const CommandDialog: React.FC<Props> = (props) => {
  const renderCommand = (type: CommandType) => {
    switch(type) {
      case CommandType.Breaker:
        return <BreakCommand onClose={props.onClose} args={props.args} />
      default:
        return ''
    }
  }

  return (
    <div style={{ padding: '10px 16px 0 16px' }}>
      {renderCommand(props.type)}
    </div>
  )
}

export default CommandDialog
