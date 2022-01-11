import React, { useRef, useState } from 'react';

interface Props {
}

const useFormError = (props: Props) => {
  const [errors, setErrors] = useState({})

  const onFieldsChange = (changedFields, allFields) => {
    const errors: any = {}
    allFields.forEach(item => {
      if (item.errors?.length) {
        errors[item.name[0]] = item.errors
      }
    })
    setErrors(errors)
  }

  const resetErrors = () => {
    setErrors({})
  }
  
  return {
    errors,
    onFieldsChange,
    resetErrors
  }
};

export default useFormError;
