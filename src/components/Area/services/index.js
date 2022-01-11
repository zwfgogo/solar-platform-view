import createServices from '../../../public/js/createServices';
import mock from './mock';
export default createServices({
  getTopArea: '/enums/areas/top/:hasAll|get',
  getChildArea: '/enums/areas/child/:hasAll|get',
  ...mock,
});
