import React, { useRef, useState } from 'react';

interface ModalViewStateItem {
  visible: boolean
  data: any
}

interface Props {
}

const useModalView = (props?: Props) => {
  const [modalViewState, setModalViewState] = useState({})

  const changeModalState = (modalName, visible, data?) => {
    const newState = { ...modalViewState }

    if (Array.isArray(modalName)) {
      modalName.forEach((name, index) => {
        const _visible = Array.isArray(visible) ? visible[index] : visible
        const _data = Array.isArray(data) ? data[index] : data

        if (!newState[name]) newState[name] = {}
        newState[name].visible = _visible
        if (_data) newState[name].data = _data
      })
    } else {
      if (!newState[modalName]) newState[modalName] = {}
      newState[modalName].visible = visible
      if (data) newState[modalName].data = data
    }

    setModalViewState(newState)
  }

  const getModalViewState = (key): ModalViewStateItem => {
    let state = modalViewState[key] || { visible: false, data: {} }
    return state
  }
  
  return {
    getModalViewState,
    changeModalState,
  }
};

export default useModalView;
