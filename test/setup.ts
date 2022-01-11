import enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

enzyme.configure({adapter: new Adapter()})

//@ts-ignore
window.matchMedia = (query) => {
  return {
    matches: query.includes('max-width'),
    addListener: () => {
    },
    removeListener: () => {
    }
  }
}
