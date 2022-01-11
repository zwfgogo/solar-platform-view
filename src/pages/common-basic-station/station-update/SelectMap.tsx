import React from 'react'
import { Button, Spin } from 'wanke-gui'
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'

interface Props extends PageProps {
  longitude: number;
  latitude: number;
  onSelect: (info: any) => void
}

/*
 * 电站 经纬度信息选择
 */
class SelectMap extends React.Component<Props, { lng: number; lat: number; loading: boolean }> {
  mapRef: React.RefObject<HTMLDivElement>

  constructor(props: Props, state) {
    super(props, state)
    this.mapRef = React.createRef<HTMLDivElement>()
    this.state = {
      loading: true,
      lng: this.fix6(props.longitude),
      lat: this.fix6(props.latitude)
    }
  }

  fix6 = (value: number | string): number => {
    if (!value) {
      return null
    }
    if (typeof value == 'string') {
      value = parseFloat(value)
    }
    return parseFloat(value.toFixed(6))
  }

  onSelect = () => {
    this.props.onSelect({ lng: this.state.lng, lat: this.state.lat })
    this.props.back()
  }

  createMap = point => {
    this.setState({ loading: false })
    let map = new BMap.Map(this.mapRef.current)

    map.centerAndZoom(point, 15)
    map.enableScrollWheelZoom()
    var size = new BMap.Size(20, 20)

    var marker = new BMap.Marker(point)
    map.addOverlay(marker)

    map.addEventListener('click', e => {
      var point = e.point
      marker.setPosition(new BMap.Point(point.lng, point.lat))
      this.setState({ lng: this.fix6(point.lng), lat: this.fix6(point.lat) })
    })
    map.addControl(
      new BMap.CityListControl({
        anchor: window.BMAP_ANCHOR_TOP_LEFT,
        offset: size,
        onChangeAfter: () => {
          let center = map.getCenter()
          marker.setPosition(new BMap.Point(center.lng, center.lat))
          this.setState({ lng: this.fix6(center.lng), lat: this.fix6(center.lat) })
        }
      })
    )

    // 添加定位控件
    var geolocationControl = new BMap.GeolocationControl()
    map.addControl(geolocationControl)
  }

  componentDidMount() {
    let point = null
    let self = this
    if (!this.props.longitude && !this.props.latitude) {
      let geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == window.BMAP_STATUS_SUCCESS) {
          self.createMap(r.point)
          self.setState({ lng: self.fix6(r.point.lng), lat: self.fix6(r.point.lat) })
        } else {
          point = new BMap.Point(116.404, 39.915) //北京
          self.createMap(point)
          self.setState({ lng: 116.404, lat: 39.915 })
        }
      })
    } else {
      point = new BMap.Point(this.props.longitude, this.props.latitude)
      this.createMap(point)
    }
  }

  render() {
    return (
      <Page pageId={this.props.pageId} pageTitle={utils.intl("经纬度选择")} className="station-map-select-page">
        <div ref={this.mapRef} style={{ height: '100%' }}></div>

        {this.state.loading && (
          <div className="getting-position">
            <Spin tip={`${utils.intl("定位中")}...`} />
          </div>
        )}

        {!this.state.loading && (
          <div className="current-position-info">
            <div className="header">{`${utils.intl("当前位置")}：`}</div>
            <div className="position-info">
              {this.state.lng != null && (
                <span>
                  {this.state.lng}，{this.state.lat}
                </span>
              )}
            </div>
            <div className="confirm">
              <Button onClick={() => this.props.back()}>{utils.intl("返回")}</Button>
              <Button type="primary" style={{ marginLeft: 7 }} onClick={this.onSelect}>
                {utils.intl("确定")}
              </Button>
            </div>
          </div>
        )}
      </Page>
    )
  }
}

export default SelectMap
