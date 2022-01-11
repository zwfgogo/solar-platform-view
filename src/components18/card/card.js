import React, { Component } from 'react';
import './card.less';

class Card extends Component {
  render() {
    let { width, height, title, icon, onMouseOut } = this.props;
    width = width ? width : '100%';
    // height = height?height:'100%'111 ;
    let { opposite,className } = this.props;
    opposite = opposite ? 'opposite' : '';
    className = className ? className : '';
    return (
        <div className={"y_card"} style={{ width: '100%',height:'100%' }} onMouseOut={onMouseOut}>
          <div className="card_head" >
            {this.props.icon ? <div className={icon}></div> : null}
            {this.props.icon
              ? <span className="title">{title}</span>
              : <span className="no_icon">{title}</span>
            }
          </div>
          <div className="card_body">
            {this.props.children}
          </div>
        </div>
    );
  }
}

export default Card;
