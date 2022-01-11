import createServices from '../../../../public/js/createServices';
export default createServices({
  getList: '/basic-data-management/prices/generate|get',
  addPrice: '/basic-data-management/prices/generate|post',
  editPrice: '/basic-data-management/prices/generate/:id|put',
  delPrice: '/basic-data-management/prices/generate/:id|DELETE',
  getIsbind: '/basic-data-management/prices/isBind/:id|get',
});
