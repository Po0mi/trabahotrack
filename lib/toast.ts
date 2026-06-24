type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

export function toast(message: string, type: ToastType = "success") {
  const id = Math.random().toString(36).slice(2, 9);
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((fn) => fn(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((fn) => fn(toasts));
  }, 3500);
}

export function subscribeToasts(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getToasts() {
  return toasts;
}
