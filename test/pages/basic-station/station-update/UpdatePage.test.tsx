import React from 'react'
import enzyme from 'enzyme'
import { Tabs } from 'wanke-gui'
import { UpdatePage } from '../../../../src/pages/basic-station/station-update/UpdatePage'
import { StationUpdateModel } from '../../../../src/pages/basic-station/models/station-update'
import Page from '../../../../src/components/Page'

let props: any = {
  ...new StationUpdateModel(),
  stationTypes: [],
  priceRates: [],
  dispatch: () => null,
  action: () => null
}

describe('test UpdatePage', () => {
  it('test station title', () => {
    let wrapper = enzyme.shallow(
      <UpdatePage
        {...props}
        basicInfo={{title: 'abc'}}
      />
    )
    expect(wrapper.find(Page).prop('pageTitle')).toBe('新增电站')

    wrapper = enzyme.shallow(
      <UpdatePage
        {...props}
        stationId={1}
        basicInfo={{title: 'abc'}}
      />
    )
    expect(wrapper.find(Page).prop('pageTitle')).toBe('abc')
  })

  it('test addStation', () => {
    let wrapper = enzyme.mount(
      <UpdatePage {...props}/>
    )
    expect(wrapper.find(Tabs.TabPane).length).toBe(1)
    let str = wrapper.debug()
    wrapper.setProps({addStationSuccess: true, newStationId: 2})
    wrapper.update()
    expect(wrapper.find(Tabs.TabPane).length).toBe(4)
  })
  it('test update', () => {
    let modal = new StationUpdateModel()
    let props: any = {}
    const wrapper = enzyme.shallow(<UpdatePage {...modal} {...props} stationId={1}/>)
    expect(wrapper.find(Tabs.TabPane).length).toBe(4)
  })
})
