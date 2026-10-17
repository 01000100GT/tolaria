import { useEffect, useLayoutEffect, useRef } from 'react'
import { optionalNativeMobileKeyCommandsModule } from '../native/mobileNativeKeyCommands'
import { createMobileModalDismissal } from './mobileModalDismissal'
import { installMobileWorkspaceKeyboardShortcuts } from './mobileWorkspaceKeyboardShortcuts'

let unsubscribe: (() => void) | undefined
const modals = createMobileModalDismissal(active => {
  unsubscribe?.()
  unsubscribe = active ? installMobileWorkspaceKeyboardShortcuts(event => modals.dismiss(event)) : undefined
  void optionalNativeMobileKeyCommandsModule()?.setModalOpen?.(active)
})

export function useMobileModalDismiss(onClose: () => void, active = true) {
  const current = useRef(onClose)
  useLayoutEffect(() => { current.current = onClose }, [onClose])
  useEffect(() => {
    if (active) return modals.register(() => current.current())
  }, [active])
}
