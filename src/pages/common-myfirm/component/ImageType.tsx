import React from 'react'
import classnames from 'classnames'
import NewUpload from '../../../public/components/NewUpload'
import Label from '../../../components/Label'
import wrapper1, { CommonProp1 } from '../../../components/input-item/wrapper1'
import utils from '../../../public/js/utils'

interface Props {
  files?: string[];
  value?: string
  onChange?: (files: any[], name: string) => void
  theme?: string
}
const ImageType: React.FC<Props> = function (this: null, props) {
  const callback = (files, url, name) => {
    if (typeof files === 'string') {
      files = [{ name: files, data: url }]
    } else {
      files = files.map(item => ({ name: item.name, data: item.thumbUrl }))
    }
    props.onChange(files, name)
  }

  // if (!props.value) {
  //   return null
  // }
  return (
    <>
      <NewUpload
        callback={callback}
        acceptType={['png']}
        maxSize={400}
        accept={'.png'}
        fileUrl={props.files[0]}
        callbackOnInit
        uploadName={utils.intl('浅色logo')}
        theme={props.theme}
      />
      <NewUpload
        callback={callback}
        acceptType={['png']}
        maxSize={400}
        accept={'.png'}
        fileUrl={props.files[1]}
        callbackOnInit
        uploadName={utils.intl('深色logo')}
        theme={props.theme}
      />
    </>
  )
}

export default ImageType
