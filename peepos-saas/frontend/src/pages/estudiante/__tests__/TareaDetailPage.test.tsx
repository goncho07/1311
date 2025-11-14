/**
 * ═══════════════════════════════════════════════════════════
 * TESTS - TareaDetailPage
 * ═══════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TareaDetailPage from '../TareaDetailPage';
import * as estudianteApi from '../../../api/endpoints/estudiante';

// Mock del módulo estudiante API
vi.mock('../../../api/endpoints/estudiante', () => ({
  estudianteApi: {
    getTareaDetalle: vi.fn(),
    entregarTarea: vi.fn(),
  },
}));

// Mock para useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock data - Tarea sin entregar
const mockTareaSinEntregar = {
  success: true,
  tarea: {
    id: '1',
    titulo: 'Ensayo sobre la Fotosíntesis',
    descripcion: 'Escribir un ensayo sobre el proceso de fotosíntesis',
    instrucciones: 'Debe tener introducción, desarrollo y conclusión. Mínimo 500 palabras.',
    area: 'Biología',
    docente: 'Prof. María González',
    tipo: 'Ensayo',
    fecha_asignacion: '2024-01-10',
    fecha_entrega: '2024-01-20T23:59:00',
    permite_entrega_tardia: false,
    puntos_maximos: 20,
    peso: 15,
    archivos_adjuntos: [],
    rubrica: null,
  },
  entrega: null, // Sin entregar
};

// Mock data - Tarea ya entregada
const mockTareaEntregada = {
  ...mockTareaSinEntregar,
  entrega: {
    id: '1',
    fecha_entrega: '2024-01-18T14:30:00',
    contenido: 'Este es mi ensayo sobre fotosíntesis...',
    archivos: [],
    estado: 'Entregado',
    puntos_obtenidos: 18,
    retroalimentacion: 'Excelente trabajo, muy completo y bien estructurado.',
    fecha_revision: '2024-01-19T10:00:00',
  },
};

// Helper para renderizar con Router y parámetro
const renderWithRouter = (tareaId = '1') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/mis-tareas/:tareaId" element={<TareaDetailPage />} />
      </Routes>
    </BrowserRouter>,
    { wrapper: ({ children }) => (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </BrowserRouter>
    )}
  );
};

describe('TareaDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL params
    Object.defineProperty(window, 'location', {
      value: { pathname: '/mis-tareas/1' },
      writable: true,
    });
  });

  describe('Estado de Carga', () => {
    it('debe mostrar spinner mientras carga la tarea', () => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter();

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Renderizado de Detalle de Tarea', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe renderizar el título de la tarea', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Ensayo sobre la Fotosíntesis')).toBeInTheDocument();
      });
    });

    it('debe renderizar el área curricular', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Biología')).toBeInTheDocument();
      });
    });

    it('debe renderizar el nombre del docente y tipo de tarea', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Prof. María González/i)).toBeInTheDocument();
        expect(screen.getByText(/Ensayo/i)).toBeInTheDocument();
      });
    });

    it('debe renderizar la descripción de la tarea', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/Escribir un ensayo sobre el proceso de fotosíntesis/i)
        ).toBeInTheDocument();
      });
    });

    it('debe renderizar las instrucciones cuando existen', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/Debe tener introducción, desarrollo y conclusión/i)
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar puntos máximos y peso', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument(); // Puntos máximos
        expect(screen.getByText('15%')).toBeInTheDocument(); // Peso
      });
    });
  });

  describe('Formulario de Entrega', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe mostrar el formulario de entrega cuando la tarea no está entregada', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });
    });

    it('debe mostrar textarea para el contenido', async () => {
      renderWithRouter();

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(
          /escribe aquí tu respuesta/i
        );
        expect(textarea).toBeInTheDocument();
      });
    });

    it('debe mostrar área de upload de archivos', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/click para seleccionar/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/máximo 5 archivos, 10mb cada uno/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validación de Formulario de Entrega', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe validar que el contenido no esté vacío', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/debes escribir un contenido para la entrega/i)
        ).toBeInTheDocument();
      });

      expect(estudianteApi.estudianteApi.entregarTarea).not.toHaveBeenCalled();
    });

    it('debe validar longitud mínima del contenido (10 caracteres)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe aquí tu respuesta/i);
      await user.type(textarea, 'Corto'); // Solo 5 caracteres

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/el contenido debe tener al menos 10 caracteres/i)
        ).toBeInTheDocument();
      });

      expect(estudianteApi.estudianteApi.entregarTarea).not.toHaveBeenCalled();
    });

    it('debe validar cantidad máxima de archivos (5)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/click para seleccionar/i)).toBeInTheDocument();
      });

      // Crear 6 archivos
      const files = Array.from({ length: 6 }, (_, i) =>
        new File([`file ${i}`], `file${i}.pdf`, { type: 'application/pdf' })
      );

      const input = screen.getByLabelText(/click para seleccionar/i)
        .querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      await waitFor(() => {
        expect(
          screen.getByText(/puedes adjuntar un máximo de 5 archivos/i)
        ).toBeInTheDocument();
      });
    });

    it('debe validar tamaño máximo de archivo (10MB)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/click para seleccionar/i)).toBeInTheDocument();
      });

      // Crear archivo de 11MB
      const largeFile = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'large.pdf',
        { type: 'application/pdf' }
      );

      const input = screen.getByLabelText(/click para seleccionar/i)
        .querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, [largeFile]);

      await waitFor(() => {
        expect(
          screen.getByText(/supera los 10mb/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Envío de Tarea', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe enviar la tarea con contenido válido', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.entregarTarea).mockResolvedValue({
        success: true,
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe aquí tu respuesta/i);
      await user.type(textarea, 'Este es mi ensayo completo sobre fotosíntesis...');

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(estudianteApi.estudianteApi.entregarTarea).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            contenido: expect.stringContaining('Este es mi ensayo completo'),
            archivos: [],
          })
        );
      });
    });

    it('debe mostrar mensaje de éxito después de entregar', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.entregarTarea).mockResolvedValue({
        success: true,
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe aquí tu respuesta/i);
      await user.type(textarea, 'Este es mi ensayo completo sobre fotosíntesis...');

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/tarea entregada exitosamente/i)
        ).toBeInTheDocument();
      });
    });

    it('debe manejar errores en el envío', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.entregarTarea).mockRejectedValue(
        new Error('Error de conexión')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe aquí tu respuesta/i);
      await user.type(textarea, 'Este es mi ensayo completo sobre fotosíntesis...');

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/error al entregar tarea/i)
        ).toBeInTheDocument();
      });
    });

    it('debe deshabilitar el botón durante el envío', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.entregarTarea).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/escribe aquí tu respuesta/i);
      await user.type(textarea, 'Este es mi ensayo completo sobre fotosíntesis...');

      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      // El botón debe estar deshabilitado y mostrar "Enviando..."
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/enviando/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upload de Archivos', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe mostrar los archivos seleccionados', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/click para seleccionar/i)).toBeInTheDocument();
      });

      const files = [
        new File(['file1'], 'documento1.pdf', { type: 'application/pdf' }),
        new File(['file2'], 'documento2.pdf', { type: 'application/pdf' }),
      ];

      const input = screen.getByLabelText(/click para seleccionar/i)
        .querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText('documento1.pdf')).toBeInTheDocument();
        expect(screen.getByText('documento2.pdf')).toBeInTheDocument();
        expect(screen.getByText(/archivos seleccionados \(2\/5\)/i)).toBeInTheDocument();
      });
    });

    it('debe permitir eliminar archivos seleccionados', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/click para seleccionar/i)).toBeInTheDocument();
      });

      const files = [
        new File(['file1'], 'documento1.pdf', { type: 'application/pdf' }),
        new File(['file2'], 'documento2.pdf', { type: 'application/pdf' }),
      ];

      const input = screen.getByLabelText(/click para seleccionar/i)
        .querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText('documento1.pdf')).toBeInTheDocument();
      });

      // Eliminar el primer archivo
      const deleteButtons = screen.getAllByTitle('Eliminar archivo');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('documento1.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('documento2.pdf')).toBeInTheDocument();
        expect(screen.getByText(/archivos seleccionados \(1\/5\)/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar el tamaño de los archivos en MB', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/click para seleccionar/i)).toBeInTheDocument();
      });

      const file = new File(
        [new ArrayBuffer(2 * 1024 * 1024)], // 2MB
        'documento.pdf',
        { type: 'application/pdf' }
      );

      const input = screen.getByLabelText(/click para seleccionar/i)
        .querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, [file]);

      await waitFor(() => {
        expect(screen.getByText(/2\.00 MB/i)).toBeInTheDocument();
      });
    });
  });

  describe('Vista de Entrega Realizada', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaEntregada
      );
    });

    it('debe mostrar el contenido entregado', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/este es mi ensayo sobre fotosíntesis/i)
        ).toBeInTheDocument();
      });
    });

    it('debe mostrar la fecha de entrega', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/entregado/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar la calificación cuando existe', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/18 pts/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar la retroalimentación del docente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(
          screen.getByText(/excelente trabajo, muy completo y bien estructurado/i)
        ).toBeInTheDocument();
      });
    });

    it('no debe mostrar el formulario de entrega cuando ya está entregada', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/tu entrega/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /entregar tarea/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Navegación', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe tener botón para volver a la lista de tareas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/volver a tareas/i)).toBeInTheDocument();
      });
    });

    it('debe navegar a /mis-tareas al hacer click en volver', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/volver a tareas/i)).toBeInTheDocument();
      });

      const backButton = screen.getByText(/volver a tareas/i);
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/mis-tareas');
    });
  });

  describe('Mensajes de Estado', () => {
    beforeEach(() => {
      vi.mocked(estudianteApi.estudianteApi.getTareaDetalle).mockResolvedValue(
        mockTareaSinEntregar
      );
    });

    it('debe permitir cerrar mensajes de error', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entregar tarea/i })).toBeInTheDocument();
      });

      // Generar un error
      const submitButton = screen.getByRole('button', { name: /entregar tarea/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/debes escribir un contenido para la entrega/i)
        ).toBeInTheDocument();
      });

      // Cerrar el mensaje de error
      const closeButton = screen.getByRole('button', { hidden: true });
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/debes escribir un contenido para la entrega/i)
        ).not.toBeInTheDocument();
      });
    });
  });
});
