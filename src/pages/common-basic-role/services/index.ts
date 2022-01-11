import createServices from '../../../public/js/createServices'

export default createServices({
  getRolesTree: '/tree/firm|get',
  rolesAdd: '/basic-data-management/roles|post',
  rolesEdit: '/basic-data-management/roles/:id|put',
  rolesDelete: '/basic-data-management/roles/:id|delete',
  getRolesMenu: '/basic-data-management/roles/:curRoleId/menus|get',
  rolesMenuEdit: '/basic-data-management/roles/:roleId/menus|put',
  getRolesInformation: '/basic-data-management/roles|get'
})
