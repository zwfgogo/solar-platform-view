import React from 'react';
export default  function FormItemUnit(props) {
    const {style} = props;
    return (
        <div className='form-item-unit' style={style}>
            {props.children}
        </div>
    );
}