import React from 'react';

interface UnitProps {
  unit: string
  style?: React.CSSProperties
}

export function withUnit<Props>(Component) {
  return (props: Props & UnitProps) => {
    const { unit, style, ...rest } = props
    return (
      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <div style={{ flexGrow: 1 }}>
          <Component {...rest} style={{ ...style, width: '100%' }} />
        </div>
        <span style={{ flexShrink: 0, marginLeft: 8 }}>{unit}</span>
      </div>
    )
  }
}