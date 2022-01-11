import { ValidationRule } from '../../interfaces/CommonInterface'
import { CSSProperties } from 'react'

export interface BasicProps {
  name?: string
  label?: string
  rules?: ValidationRule[]
  disabled?: boolean
  style?: CSSProperties
}