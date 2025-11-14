<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Estudiante;
use App\Services\Import\EstudianteImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Tests de Importación de Datos
 *
 * Verifica el sistema de importación masiva:
 * - Importación desde Excel
 * - Validación de datos
 * - Manejo de errores
 * - Actualización masiva
 */
class ImportacionTest extends TestCase
{
    use RefreshDatabase;

    protected EstudianteImportService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(EstudianteImportService::class);
        Storage::fake('local');
    }

    /** @test */
    public function can_import_students_from_excel()
    {
        // Crear archivo Excel de prueba
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['12345678', 'Juan Carlos', 'Pérez', 'García', '2010-05-15', '5°', 'A'],
            ['87654321', 'María Elena', 'López', 'Torres', '2010-08-20', '5°', 'A'],
            ['11223344', 'Pedro José', 'Ramírez', 'Silva', '2010-03-10', '5°', 'B'],
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(3, $resultado['exitosos']);
        $this->assertEquals(0, $resultado['errores']);
        $this->assertEquals(3, Estudiante::count());

        // Verificar datos importados
        $estudiante = Estudiante::where('dni', '12345678')->first();
        $this->assertEquals('Juan Carlos', $estudiante->nombres);
        $this->assertEquals('Pérez', $estudiante->apellido_paterno);
    }

    /** @test */
    public function validates_required_fields_during_import()
    {
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['', 'Juan', 'Pérez', 'García', '2010-05-15', '5°', 'A'], // DNI vacío
            ['12345678', '', 'López', 'Torres', '2010-08-20', '5°', 'A'], // Nombres vacío
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(0, $resultado['exitosos']);
        $this->assertEquals(2, $resultado['errores']);
        $this->assertCount(2, $resultado['detalles_errores']);
        $this->assertEquals(0, Estudiante::count());
    }

    /** @test */
    public function validates_dni_format()
    {
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['123', 'Juan', 'Pérez', 'García', '2010-05-15', '5°', 'A'], // DNI muy corto
            ['12345678901', 'María', 'López', 'Torres', '2010-08-20', '5°', 'A'], // DNI muy largo
            ['ABCD1234', 'Pedro', 'Ramírez', 'Silva', '2010-03-10', '5°', 'B'], // DNI con letras
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(0, $resultado['exitosos']);
        $this->assertEquals(3, $resultado['errores']);
        $this->assertEquals(0, Estudiante::count());
    }

    /** @test */
    public function validates_date_format()
    {
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['12345678', 'Juan', 'Pérez', 'García', '15/05/2010', '5°', 'A'], // Formato incorrecto
            ['87654321', 'María', 'López', 'Torres', 'invalid-date', '5°', 'A'], // Fecha inválida
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(0, $resultado['exitosos']);
        $this->assertEquals(2, $resultado['errores']);
    }

    /** @test */
    public function prevents_duplicate_dni_import()
    {
        // Crear estudiante existente
        Estudiante::factory()->create(['dni' => '12345678']);

        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['12345678', 'Juan', 'Pérez', 'García', '2010-05-15', '5°', 'A'], // DNI duplicado
            ['87654321', 'María', 'López', 'Torres', '2010-08-20', '5°', 'A'], // DNI nuevo
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(1, $resultado['exitosos']);
        $this->assertEquals(1, $resultado['errores']);
        $this->assertEquals(2, Estudiante::count()); // Solo se agregó el nuevo
    }

    /** @test */
    public function can_update_existing_students_on_import()
    {
        // Crear estudiante existente
        $estudiante = Estudiante::factory()->create([
            'dni' => '12345678',
            'nombres' => 'Juan Original',
            'grado' => '4°'
        ]);

        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['12345678', 'Juan Actualizado', 'Pérez', 'García', '2010-05-15', '5°', 'A'],
        ]);

        $resultado = $this->service->importar($file, ['modo' => 'actualizar']);

        $this->assertEquals(1, $resultado['actualizados']);
        $this->assertEquals(0, $resultado['errores']);

        $estudiante->refresh();
        $this->assertEquals('Juan Actualizado', $estudiante->nombres);
        $this->assertEquals('5°', $estudiante->grado);
    }

    /** @test */
    public function handles_large_file_import()
    {
        // Simular importación de 1000 estudiantes
        $data = [['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección']];

        for ($i = 1; $i <= 1000; $i++) {
            $data[] = [
                str_pad($i, 8, '0', STR_PAD_LEFT),
                "Estudiante $i",
                'Apellido1',
                'Apellido2',
                '2010-01-01',
                '5°',
                'A'
            ];
        }

        $file = $this->createTestExcelFile($data);

        $resultado = $this->service->importar($file);

        $this->assertEquals(1000, $resultado['exitosos']);
        $this->assertEquals(0, $resultado['errores']);
        $this->assertEquals(1000, Estudiante::count());
    }

    /** @test */
    public function validates_maximum_rows_limit()
    {
        $data = [['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección']];

        // Intentar importar más de 5000 filas (límite configurado)
        for ($i = 1; $i <= 5001; $i++) {
            $data[] = [
                str_pad($i, 8, '0', STR_PAD_LEFT),
                "Estudiante $i",
                'Apellido1',
                'Apellido2',
                '2010-01-01',
                '5°',
                'A'
            ];
        }

        $file = $this->createTestExcelFile($data);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El archivo excede el límite de 5000 filas');

        $this->service->importar($file);
    }

    /** @test */
    public function provides_detailed_error_report()
    {
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección'],
            ['', 'Juan', 'Pérez', 'García', '2010-05-15', '5°', 'A'], // Fila 2: DNI vacío
            ['123', 'María', 'López', 'Torres', '2010-08-20', '5°', 'A'], // Fila 3: DNI inválido
            ['12345678', '', 'Ramírez', 'Silva', '2010-03-10', '5°', 'B'], // Fila 4: Nombres vacío
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(0, $resultado['exitosos']);
        $this->assertEquals(3, $resultado['errores']);
        $this->assertCount(3, $resultado['detalles_errores']);

        // Verificar que los errores tengan la información correcta
        $this->assertEquals(2, $resultado['detalles_errores'][0]['fila']);
        $this->assertStringContainsString('DNI', $resultado['detalles_errores'][0]['mensaje']);

        $this->assertEquals(3, $resultado['detalles_errores'][1]['fila']);
        $this->assertStringContainsString('DNI', $resultado['detalles_errores'][1]['mensaje']);
    }

    /** @test */
    public function can_import_with_optional_fields()
    {
        $file = $this->createTestExcelFile([
            ['DNI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Fecha Nacimiento', 'Grado', 'Sección', 'Email', 'Teléfono'],
            ['12345678', 'Juan', 'Pérez', 'García', '2010-05-15', '5°', 'A', 'juan@example.com', '987654321'],
            ['87654321', 'María', 'López', 'Torres', '2010-08-20', '5°', 'A', '', ''], // Sin campos opcionales
        ]);

        $resultado = $this->service->importar($file);

        $this->assertEquals(2, $resultado['exitosos']);
        $this->assertEquals(0, $resultado['errores']);

        $estudiante1 = Estudiante::where('dni', '12345678')->first();
        $this->assertEquals('juan@example.com', $estudiante1->email);

        $estudiante2 = Estudiante::where('dni', '87654321')->first();
        $this->assertNull($estudiante2->email);
    }

    /**
     * Helper para crear archivo Excel de prueba
     */
    protected function createTestExcelFile(array $data): UploadedFile
    {
        $filename = 'test_import_' . time() . '.xlsx';

        // Aquí normalmente usarías una librería como PhpSpreadsheet
        // Por simplicidad, creamos un CSV que simula un Excel
        $content = '';
        foreach ($data as $row) {
            $content .= implode(',', $row) . "\n";
        }

        Storage::put($filename, $content);

        return new UploadedFile(
            Storage::path($filename),
            $filename,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );
    }
}
