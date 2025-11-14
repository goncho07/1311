import React from 'react';
import { HTMLMotionProps } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import Button from './Button';

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'disabled' | 'children'> {
  icon: React.ComponentType<LucideProps> | (() => React.ReactElement);
  'aria-label': string;
  variant?: 'filled' | 'tonal' | 'outlined' | 'danger' | 'warning' | 'text';
  size?: 'md';
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  return <Button iconOnly {...props} />;
};

export default IconButton;