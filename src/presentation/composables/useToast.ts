import { ref, readonly, type DeepReadonly, type Ref } from 'vue'
import { Toast, type ToastOptions } from '../entities'

const toasts = ref<Toast[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function show(options: ToastOptions): Toast {
  const toast = new Toast(options)
  toasts.value = [...toasts.value, toast]

  if (toast.duration > 0) {
    const timer = setTimeout(() => dismiss(toast.id), toast.duration)
    timers.set(toast.id, timer)
  }

  return toast
}

function dismiss(id: number): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function info(message: string, duration?: number): Toast {
  return show({ message, variant: 'info', duration })
}

function success(message: string, duration?: number): Toast {
  return show({ message, variant: 'success', duration })
}

function error(message: string, duration?: number): Toast {
  return show({ message, variant: 'error', duration })
}

export interface UseToastReturn {
  toasts: DeepReadonly<Ref<Toast[]>>
  show: (options: ToastOptions) => Toast
  dismiss: (id: number) => void
  info: (message: string, duration?: number) => Toast
  success: (message: string, duration?: number) => Toast
  error: (message: string, duration?: number) => Toast
}

export function useToast(): UseToastReturn {
  return {
    toasts: readonly(toasts),
    show,
    dismiss,
    info,
    success,
    error,
  }
}
