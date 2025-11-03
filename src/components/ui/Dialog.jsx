import { X } from 'lucide-react'
import { Button } from './Button'

export function Dialog({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, onClose }) {
  return (
    <div className="flex items-center justify-between p-6 pb-4 border-b">
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
}

export function DialogContent({ children }) {
  return <div className="p-6 pt-4">{children}</div>
}

export function DialogFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t bg-gray-50 rounded-b-lg">
      {children}
    </div>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'destructive' }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-gray-600">{message}</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export function AlertDialog({ isOpen, onClose, title, message, buttonText = 'OK' }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-gray-600">{message}</p>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose}>{buttonText}</Button>
      </DialogFooter>
    </Dialog>
  )
}
