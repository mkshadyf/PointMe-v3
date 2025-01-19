import { useCallback } from 'react'
import { useSnackbar, VariantType } from 'notistack/index'

interface ToastOptions {
  variant?: VariantType
  autoHideDuration?: number
}

export function useToast() {
  const { enqueueSnackbar } = useSnackbar()

  const toast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const { variant = 'default', autoHideDuration = 3000 } = options
      enqueueSnackbar(message, {
        variant,
        autoHideDuration,
      })
    },
    [enqueueSnackbar]
  )

  return toast
}

export default useToast
