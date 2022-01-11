import React, {FC} from 'react'
import {Button} from 'wanke-gui'
import navigateHoc from '../../navigateHoc'
import utils from '../../../public/js/utils'

const Back: FC<any> = ({back, children}) => {
  return (
    <Button
      onClick={back}
    >
      {children || utils.intl('返回')}
    </Button>
  )
}
export default navigateHoc(Back)
