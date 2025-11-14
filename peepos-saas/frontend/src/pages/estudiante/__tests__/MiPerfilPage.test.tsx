/**
 * ═══════════════════════════════════════════════════════════
 * TESTS - MiPerfilPage
 * ═══════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MiPerfilPage from '../MiPerfilPage';
import * as estudianteApi from '../../../api/endpoints/estudiante';

// Mock del módulo estudiante API
vi.mock('../../../api/endpoints/estudiante', () => ({
  estudianteApi: {
    getMiPerfil: vi.fn(),
    actualizarPerfil: vi.fn(),
  },
}));

// Mock data
const mockPerfilData = {
  success: true,
  estudiante: {
    nombre_completo: 'Juan Pérez García',
    codigo: 'EST001',
    tipo_documento: 'DNI',
    numero_documento: '12345678',
    fecha_nacimiento: '2010-05-15',
    edad: 14,
    genero: 'Masculino',
    direccion: 'Av. Los Olivos 123',
    distrito: 'San Isidro',
    telefono_emergencia: '987654321',
    foto_perfil: 'https://example.com/foto.jpg',
  },
  matricula: {
    grado: '3ro Secundaria',
    seccion: 'A',
    nivel: 'Secundaria',
    periodo: '2024',
  },
  apoderados: [
    {
      nombre_completo: 'María García López',
      tipo_relacion: 'Madre',
      telefono: '987654321',
      email: 'maria@example.com',
    },
    {
      nombre_completo: 'Carlos Pérez Sánchez',
      tipo_relacion: 'Padre',
      telefono: '987654322',
      email: 'carlos@example.com',
    },
  ],
};

// Helper para renderizar con Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MiPerfilPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado de Carga', () => {
    it('debe mostrar spinner de carga inicialmente', () => {
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter(<MiPerfilPage />);

      expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
    });
  });

  describe('Estado de Error', () => {
    it('debe mostrar mensaje de error cuando falla la carga', async () => {
      const errorMessage = 'Error al conectar con el servidor';
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockRejectedValue(
        new Error(errorMessage)
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('debe permitir reintentar cuando falla la carga', async () => {
      const errorMessage = 'Error de red';
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil)
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockResolvedValueOnce(mockPerfilData);

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de Datos Personales', () => {
    beforeEach(async () => {
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        mockPerfilData
      );
    });

    it('debe renderizar el nombre completo del estudiante', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });
    });

    it('debe renderizar el código del estudiante', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText(/EST001/i)).toBeInTheDocument();
      });
    });

    it('debe renderizar la información de matrícula', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText(/3ro Secundaria - A/i)).toBeInTheDocument();
        expect(screen.getByText(/Secundaria • 2024/i)).toBeInTheDocument();
      });
    });

    it('debe renderizar todos los datos personales', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        // Tipo y número de documento
        expect(screen.getByText('DNI')).toBeInTheDocument();
        expect(screen.getByText('12345678')).toBeInTheDocument();

        // Edad
        expect(screen.getByText('14 años')).toBeInTheDocument();

        // Género
        expect(screen.getByText('Masculino')).toBeInTheDocument();

        // Dirección
        expect(screen.getByText('Av. Los Olivos 123')).toBeInTheDocument();
        expect(screen.getByText('San Isidro')).toBeInTheDocument();

        // Teléfono de emergencia (puede aparecer múltiples veces)
        const phones = screen.getAllByText('987654321');
        expect(phones.length).toBeGreaterThan(0);
      });
    });

    it('debe renderizar la foto de perfil cuando existe', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        const img = screen.getByAltText('Foto de perfil');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
      });
    });

    it('debe mostrar icono placeholder cuando no hay foto de perfil', async () => {
      const dataWithoutPhoto = {
        ...mockPerfilData,
        estudiante: { ...mockPerfilData.estudiante, foto_perfil: undefined },
      };

      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        dataWithoutPhoto
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        // El componente muestra un div con icono User cuando no hay foto
        expect(screen.queryByAltText('Foto de perfil')).not.toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de Apoderados', () => {
    beforeEach(async () => {
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        mockPerfilData
      );
    });

    it('debe renderizar la lista de apoderados', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('María García López')).toBeInTheDocument();
        expect(screen.getByText('Carlos Pérez Sánchez')).toBeInTheDocument();
      });
    });

    it('debe mostrar el tipo de relación de cada apoderado', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Madre')).toBeInTheDocument();
        expect(screen.getByText('Padre')).toBeInTheDocument();
      });
    });

    it('debe mostrar la información de contacto de los apoderados', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('maria@example.com')).toBeInTheDocument();
        expect(screen.getByText('carlos@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Cambio de Foto de Perfil', () => {
    beforeEach(async () => {
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        mockPerfilData
      );
    });

    it('debe permitir seleccionar un archivo de imagen', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      const file = new File(['fake image'], 'test.png', { type: 'image/png' });
      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      // Verificar que se llamó a actualizarPerfil
      await waitFor(() => {
        expect(estudianteApi.estudianteApi.actualizarPerfil).toHaveBeenCalled();
      });
    });

    it('debe validar que el archivo sea una imagen', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      const file = new File(['fake document'], 'test.pdf', {
        type: 'application/pdf',
      });
      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const errorElements = screen.queryAllByText(/por favor selecciona una imagen válida/i);
        expect(errorElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      expect(estudianteApi.estudianteApi.actualizarPerfil).not.toHaveBeenCalled();
    });

    it('debe validar que el archivo no supere 5MB', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      // Crear archivo de 6MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      });

      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, largeFile);

      await waitFor(() => {
        expect(
          screen.getByText(/la imagen no debe superar los 5mb/i)
        ).toBeInTheDocument();
      });

      expect(estudianteApi.estudianteApi.actualizarPerfil).not.toHaveBeenCalled();
    });

    it('debe mostrar mensaje de éxito al actualizar la foto', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.actualizarPerfil).mockResolvedValue({
        success: true,
      });

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      const file = new File(['fake image'], 'test.png', { type: 'image/png' });
      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(
          screen.getByText(/foto de perfil actualizada correctamente/i)
        ).toBeInTheDocument();
      });
    });

    it('debe manejar errores al actualizar la foto', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.actualizarPerfil).mockRejectedValue(
        new Error('Error al subir archivo')
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      const file = new File(['fake image'], 'test.png', { type: 'image/png' });
      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        const errorElements = screen.queryAllByText(/error al actualizar foto de perfil/i);
        expect(errorElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('debe mostrar indicador de carga durante el upload', async () => {
      const user = userEvent.setup();
      vi.mocked(estudianteApi.estudianteApi.actualizarPerfil).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      const file = new File(['fake image'], 'test.png', { type: 'image/png' });
      const input = screen.getByTitle('Cambiar foto de perfil')
        .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(input, file);

      // Durante la carga, el botón debe estar deshabilitado
      const uploadButton = screen.getByTitle('Cambiar foto de perfil');
      expect(uploadButton).toBeDisabled();
    });
  });

  describe('Nota Informativa', () => {
    beforeEach(async () => {
      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        mockPerfilData
      );
    });

    it('debe mostrar la nota sobre edición de datos', async () => {
      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/nota sobre edición de datos/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/solo puedes editar tu foto de perfil/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Casos Edge', () => {
    it('debe manejar perfil sin apoderados', async () => {
      const dataWithoutApoderados = {
        ...mockPerfilData,
        apoderados: [],
      };

      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        dataWithoutApoderados
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      // No debe mostrar la sección de apoderados
      expect(screen.queryByText('Mis Apoderados')).not.toBeInTheDocument();
    });

    it('debe manejar perfil sin información de matrícula', async () => {
      const dataWithoutMatricula = {
        ...mockPerfilData,
        matricula: undefined,
      };

      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        dataWithoutMatricula
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      // No debe mostrar la tarjeta de matrícula
      expect(screen.queryByText(/3ro Secundaria/i)).not.toBeInTheDocument();
    });

    it('debe manejar perfil sin teléfono de emergencia', async () => {
      const dataWithoutPhone = {
        ...mockPerfilData,
        estudiante: { ...mockPerfilData.estudiante, telefono_emergencia: undefined },
      };

      vi.mocked(estudianteApi.estudianteApi.getMiPerfil).mockResolvedValue(
        dataWithoutPhone
      );

      renderWithRouter(<MiPerfilPage />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez García')).toBeInTheDocument();
      });

      // El campo de teléfono de emergencia no debe aparecer
      const phoneFields = screen.queryAllByText('Teléfono de Emergencia');
      expect(phoneFields.length).toBe(0);
    });
  });
});
