import { mockSelect } from '../../../public/js/mockdata';
export default {
  getListP() {
  
    return mockSelect(10, (index)=>{
      return {
        name: 'sheng'+ index,
        value: index
      }
    })
  },
  getListC() {
    return mockSelect(10, (index)=>{
      return {
        name: 'shi'+ index,
        value: index
      }
    })
  },
  getListA() {
    return mockSelect(10, (index)=>{
      return {
        name: 'qu'+ index,
        value: index
      }
    })
  },

};
