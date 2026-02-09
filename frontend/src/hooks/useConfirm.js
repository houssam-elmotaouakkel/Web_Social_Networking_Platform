import { useState, useCallback } from 'react'

export function useConfirm() {
  const [state, setState] = useState({ isOpen: false, message: '', resolve: null })

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, message, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ isOpen: false, message: '', resolve: null })
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ isOpen: false, message: '', resolve: null })
  }, [state.resolve])

  return {
    confirm,
    confirmDialogProps: {
      isOpen: state.isOpen,
      message: state.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  }
}
