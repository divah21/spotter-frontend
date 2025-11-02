import * as React from 'react'
import { cn } from '@/lib/utils'

const Sheet = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange })
        }
        return child
      })}
    </div>
  )
}

const SheetTrigger = React.forwardRef(({ asChild, onClick, children, ...props }, ref) => {
  const { onOpenChange } = props
  
  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (onOpenChange) onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: handleClick,
    })
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
SheetTrigger.displayName = 'SheetTrigger'

const SheetContent = React.forwardRef(
  ({ className, side = 'right', open, onOpenChange, children, ...props }, ref) => {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/50 transition-opacity animate-in fade-in"
            onClick={() => onOpenChange?.(false)}
          />
        )}

        {/* Sheet Panel */}
        {open && (
          <div
            ref={ref}
            className={cn(
              'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out',
              'animate-in slide-in-from-left',
              side === 'left' && 'left-0 top-0 h-full',
              side === 'right' && 'right-0 top-0 h-full',
              side === 'top' && 'left-0 top-0 w-full',
              side === 'bottom' && 'bottom-0 left-0 w-full',
              className
            )}
            {...props}
          >
            {children}
          </div>
        )}
      </>
    )
  }
)
SheetContent.displayName = 'SheetContent'

export { Sheet, SheetTrigger, SheetContent }
