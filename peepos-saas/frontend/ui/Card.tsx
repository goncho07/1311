import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const isClickable = !!onClick;
  return (
    <motion.div
      whileHover={isClickable ? { y: -4, boxShadow: 'var(--shadow-lg)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-5 ${
        className || ''
      } ${
        isClickable ? 'cursor-pointer' : ''
      } transition-shadow duration-200`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;