import createServices from '../../../public/js/createServices'

export default createServices({
  getUserTree: '/tree/firm|get',
  getUserInformation: '/basic-data-management/users|get',
  usersAdd: '/basic-data-management/users|post',
  usersEdit: '/basic-data-management/users/:id|put',
  usersDelete: '/basic-data-management/users/:id|delete',
  getUsersStation: '/basic-data-management/users/stations|get',
  usersStationEdit: '/basic-data-management/users/:id/stations|put',
  getFirmsIdAndType: '/enums/firms/by-parent|get',
  getRoles: '/enums/roles|get',
  usersReset: '/basic-data-management/users/:id/resetPassword|put',
  fetchStationTypes: '/enums/stations/type/not-empty|get'
})
