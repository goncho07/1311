import React, { useState, useRef, useEffect, ReactNode, cloneElement, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopoverProps {
  trigger: ReactElement<any>;
  children: ReactNode;
  className?: string;
}

const Popover: React.FC<PopoverProps> = ({ trigger, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // FIX: Cast trigger props to `any` to safely add and call onClick handlers, resolving type errors with `cloneElement`.
  const triggerWithProps = cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen((prev) => !prev);
      if (trigger.props.onClick) {
        trigger.props.onClick(e);
      }
    },
    'aria-haspopup': true,
    'aria-expanded': isOpen,
  });

  return (
    <div className="relative" ref={popoverRef}>
      {triggerWithProps}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute right-0 top-full mt-2 z-50 ${className}`}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popover;