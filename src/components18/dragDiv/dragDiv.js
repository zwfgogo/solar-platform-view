/**
 * Created by Administrator on 2018/7/17.
 */
import React, { Component } from 'react';
import styles from './dragDiv.less'
import classnames from 'classnames'

class DragDiv extends Component {
  dragFlag = false
  x
  y
  static defaultProps = {
    dragId: 'drag'
  }
  constructor(props) {
    super(props);
    this.state={
      show:false
    }
  };
  componentDidMount(){
    var div = document.getElementById(this.props.dragId);
    this.dragFlag = false

    div.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  componentWillUnmount() {
    var div = document.getElementById(this.props.dragId);
    div.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseDown = (e) => {
    var div = document.getElementById(this.props.dragId);
    e = e || window.event;
    this.x = e.clientX - div.offsetLeft;
    this.y = e.clientY - div.offsetTop;
    this.dragFlag = true;
  }
  handleMouseMove = (e) => {
    if (this.dragFlag) {
      var div = document.getElementById(this.props.dragId);
      e = e || window.event;
      div.style.left = e.clientX - this.x + "px";
      div.style.top  = e.clientY - this.y + "px";
    }
  }
  handleMouseUp = () => {
    this.dragFlag = false;
  }

 changeShow = () =>{
    this.setState({show:true})
 }
 changeNotShow =() =>{
    this.setState({show:false})
 }
  render() {
    return (
      <div className={classnames(styles.drag, this.props.className)} id={this.props.dragId} style={{
        display: this.state.show ? 'block' : 'none'}}>
        {
          this.props.children
        }
      </div>
    );
  }
}

export default DragDiv;
