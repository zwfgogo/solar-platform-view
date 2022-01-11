import React from 'react'

interface Props {
}

const Des: React.FC<Props> = function(this: null, props) {
  return (
    <div className="ant-descriptions ant-descriptions-bordered">
      <div className="ant-descriptions-view">
        <table>
          <tbody>
          {props.children}
          </tbody>
        </table>
      </div>
    </div>
  )
}


export default Des


