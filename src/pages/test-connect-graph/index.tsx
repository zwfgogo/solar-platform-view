import { Upload } from 'antd'
import { RcFile } from 'antd/lib/upload'
import React, { useEffect, useState } from 'react'
import { history } from 'umi'
import { makeConnect } from '../umi.helper'
import ConnectLine from '../terminal-station-monitor/system-connect-line/index'
import './index.less'

interface Props {}

const TestConnectGraph: React.FC<Props> = (props) => {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const userId = sessionStorage.getItem('user-id')
    if (!userId) {
      // history.push('/')
      return
    }
  }, [])

  const handleUpload = (file: RcFile, FileList: RcFile[]) => {
    setUrl(null)
    fileByBase64(file, (base64) => {
      base64ByBlob(base64, (blob) => {
        setTimeout(() => {
          var url = window.URL.createObjectURL(blob)
          setUrl(url)
        }, 10)
      })
    })
    return false
  }

  return (
    <section className="test-connect-graph">
      <header>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <a>svg图</a>
        </Upload>
      </header>
      <footer>
          {url ? (
            <ConnectLine
              __testSvgUrl={url}
            />
          ) : ''}
      </footer>
    </section>
  )
}

export default TestConnectGraph

const fileByBase64 = (file, callback) => {
  var reader = new FileReader();
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    // target.result 该属性表示目标对象的DataURL
    callback(e.target.result)
  };
}

const base64ByBlob = (base64, callback) => {
  var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  callback(new Blob([u8arr], { type: mime }))
}
