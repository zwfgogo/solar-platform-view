import { FormInstance } from 'antd/lib/form/hooks/useForm';
import React, { useEffect } from 'react';
import ErrorTipWrapper from '../components/ErrorTipWrapper';

interface UnitProps {
  errors: string[]
  style?: React.CSSProperties
  iconStyle?: React.CSSProperties
}

export function withErrorTip<Props>(Component) {
  return (props: Props & UnitProps) => {
    const { style, errors, iconStyle, ...rest } = props
    const componentExtraProps: any = { width: '100%' }
    const errorList = errors?.filter(item => !!(item.trim())) || []
    const errorTitle = errorList[0]

    return (
      <ErrorTipWrapper errorTitle={errorTitle} iconStyle={iconStyle}>
        <Component {...rest} style={{ ...style, ...componentExtraProps }} />
      </ErrorTipWrapper>
    )
  }
}