import React from 'react'
import classnames from 'classnames'
import Upload from '../../../../public/components/Upload'
import Label from '../../../../components/Label'
import wrapper1, {CommonProp1} from '../../../../components/input-item/wrapper1'
import utils from '../../../../public/js/utils'

interface Props {
  label: string
  required: boolean
  disabled: boolean
  value: string
  onChange: (files: any[]) => void
}

const ImageType: React.FC<Props> = function (this: null, props) {
  const validator = (rule, value) => {
    if (props.required && value.length == 0) {
      return Promise.reject(utils.intl('请选择图片'))
    }
    return Promise.resolve()
  }
  return (
    <div className="input-item" style={{width: '100%'}}>
      <div className="ant-row ant-form-item">
        <Label required={props.required}>{props.label}</Label>
        <div className="ant-col ant-form-item-control">
          <div className="ant-form-item-control-input">
            <Item
              rules={[{validator}]}
              value={props.value}
              onChange={props.onChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageType

interface ImageItemProps extends CommonProp1 {
  value: { name: string, data: string }[]
  onChange: (files: any[]) => void
}

const InputItemCustomError: React.FC<ImageItemProps> = function (this: null, props) {
  const callback = (files, url) => {
    if (typeof files === 'string') {
      files = [{name: files, data: url}]
    } else {
      files = files.map(item => ({name: item.name, data: item.thumbUrl}))
    }
    props.onChange(files)
  }

  if (!props.value) {
    return null
  }
  return (
    <Upload
      className={classnames({'image-needed': props.errs.length > 0})}
      callback={callback}
      acceptType={['png', 'jpg', 'bmp']}
      maxSize={1}
      accept={'.png,.jpg,.bmp'}
      fileUrl={props.value?.[0]?.data}
      callbackOnInit
    />
  )
}

const Item = wrapper1<ImageItemProps>(InputItemCustomError)
