import createServices from '../js/createServices'

export default createServices({
  memoGetTopArea: '/enums/areas/top/:hasAll|get',
  memoGetPriceType: '/enums|get',
  memoGetVolType: '/enums|get',
  getImage: '/image|get'
})
