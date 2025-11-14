/**
 * Tests para StudentCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentCard } from './StudentCard';

describe('StudentCard', () => {
  const mockStudent = {
    id: 1,
    dni: '12345678',
    nombres: 'Juan Carlos',
    apellido_paterno: 'Pérez',
    apellido_materno: 'García',
    grado: '5°',
    seccion: 'A',
    email: 'juan@example.com',
    telefono: '987654321',
  };

  it('renders student information correctly', () => {
    render(<StudentCard student={mockStudent} />);

    expect(screen.getByText('Juan Carlos Pérez García')).toBeInTheDocument();
    expect(screen.getByText('DNI: 12345678')).toBeInTheDocument();
    expect(screen.getByText('5° - A')).toBeInTheDocument();
  });

  it('shows email when provided', () => {
    render(<StudentCard student={mockStudent} />);

    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
  });

  it('hides email when not provided', () => {
    const studentWithoutEmail = { ...mockStudent, email: undefined };
    render(<StudentCard student={studentWithoutEmail} />);

    expect(screen.queryByText('juan@example.com')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<StudentCard student={mockStudent} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockStudent);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<StudentCard student={mockStudent} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockStudent.id);
  });

  it('shows loading state when isLoading is true', () => {
    render(<StudentCard student={mockStudent} isLoading={true} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('applies correct CSS classes for different grades', () => {
    const { rerender } = render(<StudentCard student={{ ...mockStudent, grado: '1°' }} />);
    expect(screen.getByTestId('grade-badge')).toHaveClass('badge-primary');

    rerender(<StudentCard student={{ ...mockStudent, grado: '6°' }} />);
    expect(screen.getByTestId('grade-badge')).toHaveClass('badge-secondary');
  });
});
