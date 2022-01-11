import React from 'react'
import { Input } from 'wanke-gui'
import utils from '../../public/js/utils'

interface Props {
  searchKey: string
  onChange: (searchKey: string) => void
  onSearch: () => void
  placeholder?: string
}

interface State {

}

class SearchBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div className="search-container">
        <Input.Search placeholder={this.props.placeholder || utils.intl('请输入关键字查询')}
                      value={this.props.searchKey}
                      onChange={(e) => this.props.onChange(e.target.value)}
                      onSearch={this.props.onSearch}
        />
      </div>
    )
  }
}

export default SearchBox
