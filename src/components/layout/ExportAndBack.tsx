import React from 'react'
import Tools from './Tools'
import Export from './Export'
import Back1 from './Back1'

interface Props {
  onExport: () => void
  back: () => void
}

const ExportAndBack: React.FC<Props> = function(this: null, props) {
  return (
    <Tools>
      <Export onExport={props.onExport}/>
      <Back1 back={props.back}/>
    </Tools>
  )
}

export default ExportAndBack
