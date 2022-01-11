import React from 'react';
import { Checkbox } from 'wanke-gui';
import { connect } from 'dva';
interface PeakProps {
  onSelect?: any;
  onChange?: any;
  value?: any;
  priceType?: Array<any>;
}

class Peak extends React.PureComponent<PeakProps> {
  render() {
    const { onChange, onSelect, value, priceType } = this.props;
    const newChange = e => {
      onChange(e);
      onSelect && onSelect(e);
    };
    return <Checkbox.Group options={priceType} value={value} onChange={newChange} />;
  }
}
function mapStateToProps(state) {
    return {
        ...state.priceEdit
    };
}
export default connect(mapStateToProps)(Peak);