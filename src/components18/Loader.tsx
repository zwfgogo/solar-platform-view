import React, { Component } from 'react'

class Loader extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  };

  render() {
    return (
      <div className="loader">
        <div className="loader-inner line-scale-pulse-out-rapid">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }
}

export default Loader
