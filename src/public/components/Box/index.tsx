import React, {FC} from 'react'
import classnames from 'classnames'

export declare type BoxEdge = 'top' | 'left' | 'right' | 'bottom' | '' ;

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  borderWidth?: number,
  flex?: boolean,
  column?: boolean,
  wrap?: boolean,
  grow?: number,
  basis?: any,
  shrink?: number,
  className?: string,
  style?: any,
  edge?: BoxEdge,
  autoHeight?: boolean,
}

const Box: FC<BoxProps> = (props) => {
  const {className, flex, column, children, grow, style, basis, shrink, edge, borderWidth, wrap, autoHeight, ...otherProps} = props

  let newStyle: any = {}
  if (typeof grow !== 'undefined') {
    newStyle.flexGrow = grow
  }
  if (typeof shrink !== 'undefined') {
    newStyle.flexShrink = shrink
  }
  if (typeof basis !== 'undefined') {
    newStyle.flexBasis = basis
    newStyle.flexGrow = 0
    newStyle.flexShrink = 0
  }
  if (typeof wrap !== 'undefined') {
    newStyle.flexWrap = 'wrap'
    newStyle.flexGrow = 0
  }

  if (typeof autoHeight !== 'undefined') {
    newStyle.height = 'auto'
  }
  if (edge) {
    const newEdge = edge.charAt(0).toUpperCase() + edge.slice(1)
    newStyle['border' + newEdge + 'Width'] = borderWidth
    newStyle['border' + newEdge + 'Style'] = 'solid'
  }
  return (
    <div className={classnames('m-box', className, {'flex-column': column, 'f-df': flex})} style={{...newStyle, ...style}} {...otherProps}>
      {children}
    </div>
  )
}
Box.defaultProps = {
  grow: 1,
  shrink: 1,
  borderWidth: 10,
  // basis:0,
  className: '',
  edge: ''
}
export default Box