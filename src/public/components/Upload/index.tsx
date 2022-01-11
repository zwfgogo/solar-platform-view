import React, { Component } from 'react'
import classnames from 'classnames'
import { Upload, message, FullLoading } from 'wanke-gui'
import { UploadProps } from 'antd/lib/upload/interface'
import { PlusOutlined } from "wanke-icon";
import {
  WankeDeleteOutlined
} from 'wanke-icon'
import styles from './index.less'
import utils from '../../js/utils';
//
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

interface Props extends UploadProps {
  maxSize: number,
  callback: Function,
  fileUrl?: string,
  // 初始化完成之后，是否要将 url 传回去
  callbackOnInit?: boolean
  acceptType?: string[]
}

interface State {
  //图片是否已被拦截，拦截则不显示图片
  fileShow: boolean,
  fileList: any,
  imgSrc: string,
  remove: boolean,
  loading: boolean,
}

class _Upload extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      fileList: [],
      fileShow: false,
      imgSrc: '',
      loading: true
    }
  };

  beforeUpload = async (file, fileList) => {
    const { maxSize, acceptType } = this.props
    let isLt, isTp
    if (acceptType) {
      for (let i = 0; i < acceptType.length; i++) {
        if (file.name.indexOf(acceptType[i]) !== -1) {
          isTp = true
        }
      }
    } else {
      isTp = true
    }
    if (!isTp) {
      const errorMsg = utils.intl('只支持文件类型', acceptType.join('、'))
      message.error(errorMsg)
    }
    if (maxSize > 50) {
      isLt = file.size / 1024 < maxSize
      if (!isLt) {
        const errorMsg = utils.intl('文件大小限制', `${maxSize}K`)
        message.error(errorMsg)
      }
    } else {
      isLt = file.size / 1024 / 1024 < maxSize
      if (!isLt) {
        const errorMsg = utils.intl('文件大小限制', `${maxSize}M`)
        message.error(errorMsg)
      }
    }
    if (isLt && isTp) {
      await this.setState({ fileShow: true })
      let that = this;
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        if (that.props.callback) {
          that.props.callback(file.name, reader.result)
        }
        that.setState({ imgSrc: reader.result })
      };
      return isLt && isTp
    } else {
      await this.setState({ fileShow: false })
      return isLt && isTp
    }
  }
  handleChange = ({ file, fileList, event }) => {
    // getBase64(file.originFileObj).then((res)=>{
    //   if (this.state.fileShow){
    //     this.setState({ fileList });
    //     if(this.props.callback){
    //       this.props.callback(res)
    //     }
    //   }
    // })
    // console.log(file)
    // console.log(this.state.imgSrc)
    if (this.state.fileShow) {
      this.setState({ fileList: fileList })
      // if (this.props.callback) {
      //   this.props.callback(fileList,this.state.imgSrc)
      // }
    } else {
      this.setState({ fileList: [] })
      if (this.props.callback) {
        this.props.callback([])
      }
    }
  }

  componentDidMount() {
    const { callbackOnInit, fileUrl, callback } = this.props
    console.log(123, fileUrl)

    // 目前只支持单张图片上传
    if (fileUrl) {
      this.setState({
        imgSrc: fileUrl,
        fileList: [{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: fileUrl
        }]
      })
      if (callbackOnInit) {
        callback('', fileUrl)
      }
    } else {
      this.setState({
        fileList: []
      })
    }
  }

  componentDidUpdate(prevProps) {
    // 目前只支持单张图片上传
    let fileList = [...this.state.fileList]
    if (this.props.fileUrl !== prevProps.fileUrl) {
      if (this.props.fileUrl) {
        fileList = fileList.map(file => {
          if (file.uid === '-1') {
            return {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: this.props.fileUrl
            }
          }
          return file
        })
      } else {
        fileList = fileList.filter(file => file.uid !== '-1')
      }
      this.setState({
        fileList,
        imgSrc: this.props.fileUrl,
      })
    }
  }
  end = () => {
    this.setState({
      loading: false
    })
  }
  render() {
    const { fileList, imgSrc, loading } = this.state
    const uploadButton = (
      <div>
        <PlusOutlined />
      </div>
    )
    return (
      <div className={classnames(this.props.className, 'clearfix')}>
        {fileList.length >= 1 ?
          <div className={styles['remove-div']} >
            <div className={styles['remove-content']} >
              {loading && <FullLoading />}
              <img className={styles['remove-img']} src={imgSrc} onLoad={this.end} onError={this.end} />
              {loading ? ''
                :
                <div className={styles['remove-icon']}>
                  <WankeDeleteOutlined onClick={() => {
                    this.setState({ fileList: [] });
                    if (this.props.callback) {
                      this.props.callback([])
                    }
                  }}
                    style={{ position: 'absolute', color: '#fff', fontSize: '20px', cursor: 'pointer', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
              }

            </div>
          </div>
          : <Upload
            // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            listType="picture-card"
            fileList={fileList}
            showUploadList={{ showPreviewIcon: false, showDownloadIcon: false }}
            onChange={this.handleChange}
            beforeUpload={this.beforeUpload}
            {...this.props}
          >
            {fileList.length >= 1 ?
              ''
              : uploadButton}
          </Upload>}

      </div>
    )
  }
}

export default _Upload
