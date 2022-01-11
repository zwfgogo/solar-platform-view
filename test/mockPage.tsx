import React from 'react'

interface Props {
}

const MockPage: React.FC<Props> = function(this: null, props) {
  return (
    <div className="page">
      {props.children}
    </div>
  )
}

export default MockPage
