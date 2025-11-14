<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Estudiante;
use App\Models\Asistencia;
use App\Models\PeriodoAcademico;
use App\Services\Asistencia\AsistenciaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

/**
 * Tests de Asistencia
 *
 * Verifica el sistema de control de asistencias:
 * - Registro de asistencias
 * - Tipos de asistencia (presente, ausente, tardanza)
 * - Justificaciones
 * - Reportes y estadísticas
 */
class AsistenciaTest extends TestCase
{
    use RefreshDatabase;

    protected AsistenciaService $service;
    protected Estudiante $estudiante;
    protected PeriodoAcademico $periodo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(AsistenciaService::class);
        $this->periodo = PeriodoAcademico::factory()->create(['activo' => true]);
        $this->estudiante = Estudiante::factory()->create([
            'grado' => '5°',
            'seccion' => 'A',
        ]);
    }

    /** @test */
    public function can_register_attendance_present()
    {
        $asistencia = $this->service->registrarAsistencia([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'PRESENTE',
            'hora_ingreso' => '08:00:00',
        ]);

        $this->assertInstanceOf(Asistencia::class, $asistencia);
        $this->assertEquals('PRESENTE', $asistencia->tipo);
        $this->assertEquals($this->estudiante->id, $asistencia->estudiante_id);
    }

    /** @test */
    public function can_register_attendance_absent()
    {
        $asistencia = $this->service->registrarAsistencia([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'AUSENTE',
        ]);

        $this->assertEquals('AUSENTE', $asistencia->tipo);
        $this->assertNull($asistencia->hora_ingreso);
    }

    /** @test */
    public function can_register_tardiness()
    {
        $asistencia = $this->service->registrarAsistencia([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'TARDANZA',
            'hora_ingreso' => '08:30:00', // Después de las 08:00
            'minutos_tardanza' => 30,
        ]);

        $this->assertEquals('TARDANZA', $asistencia->tipo);
        $this->assertEquals(30, $asistencia->minutos_tardanza);
    }

    /** @test */
    public function can_justify_absence()
    {
        $asistencia = Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'AUSENTE',
            'justificada' => false,
        ]);

        $asistenciaJustificada = $this->service->justificarAsistencia(
            $asistencia->id,
            'Cita médica',
            'certificado_medico.pdf'
        );

        $this->assertTrue($asistenciaJustificada->justificada);
        $this->assertEquals('Cita médica', $asistenciaJustificada->motivo_justificacion);
        $this->assertEquals('certificado_medico.pdf', $asistenciaJustificada->documento_justificacion);
    }

    /** @test */
    public function cannot_register_duplicate_attendance_same_day()
    {
        // Primera asistencia
        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'PRESENTE',
        ]);

        // Intentar registrar segunda asistencia el mismo día
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Ya existe un registro de asistencia para este estudiante en esta fecha');

        $this->service->registrarAsistencia([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => now()->format('Y-m-d'),
            'tipo' => 'PRESENTE',
        ]);
    }

    /** @test */
    public function can_calculate_attendance_percentage()
    {
        $fechaInicio = Carbon::now()->subDays(10);

        // Registrar 10 días: 7 presentes, 2 ausentes, 1 tardanza
        for ($i = 0; $i < 7; $i++) {
            Asistencia::create([
                'estudiante_id' => $this->estudiante->id,
                'fecha' => $fechaInicio->copy()->addDays($i)->format('Y-m-d'),
                'tipo' => 'PRESENTE',
            ]);
        }

        for ($i = 7; $i < 9; $i++) {
            Asistencia::create([
                'estudiante_id' => $this->estudiante->id,
                'fecha' => $fechaInicio->copy()->addDays($i)->format('Y-m-d'),
                'tipo' => 'AUSENTE',
            ]);
        }

        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => $fechaInicio->copy()->addDays(9)->format('Y-m-d'),
            'tipo' => 'TARDANZA',
        ]);

        $porcentaje = $this->service->calcularPorcentajeAsistencia(
            $this->estudiante->id,
            $fechaInicio->format('Y-m-d'),
            $fechaInicio->copy()->addDays(9)->format('Y-m-d')
        );

        // 8 días efectivos (7 presentes + 1 tardanza) / 10 días = 80%
        $this->assertEquals(80, $porcentaje);
    }

    /** @test */
    public function can_register_bulk_attendance_for_class()
    {
        // Crear varios estudiantes en la misma sección
        $estudiantes = Estudiante::factory()->count(5)->create([
            'grado' => '5°',
            'seccion' => 'A',
        ]);

        $asistencias = [
            ['estudiante_id' => $estudiantes[0]->id, 'tipo' => 'PRESENTE'],
            ['estudiante_id' => $estudiantes[1]->id, 'tipo' => 'PRESENTE'],
            ['estudiante_id' => $estudiantes[2]->id, 'tipo' => 'AUSENTE'],
            ['estudiante_id' => $estudiantes[3]->id, 'tipo' => 'TARDANZA'],
            ['estudiante_id' => $estudiantes[4]->id, 'tipo' => 'PRESENTE'],
        ];

        $resultado = $this->service->registrarAsistenciaMasiva(
            now()->format('Y-m-d'),
            '5°',
            'A',
            $asistencias
        );

        $this->assertCount(5, $resultado);
        $this->assertEquals(5, Asistencia::count());
    }

    /** @test */
    public function identifies_students_with_low_attendance()
    {
        $fechaInicio = Carbon::now()->subDays(20);

        // Estudiante con baja asistencia (30%)
        for ($i = 0; $i < 20; $i++) {
            $tipo = $i < 6 ? 'PRESENTE' : 'AUSENTE';
            Asistencia::create([
                'estudiante_id' => $this->estudiante->id,
                'fecha' => $fechaInicio->copy()->addDays($i)->format('Y-m-d'),
                'tipo' => $tipo,
            ]);
        }

        $porcentaje = $this->service->calcularPorcentajeAsistencia(
            $this->estudiante->id,
            $fechaInicio->format('Y-m-d'),
            $fechaInicio->copy()->addDays(19)->format('Y-m-d')
        );

        $this->assertEquals(30, $porcentaje);

        // Verificar alerta de baja asistencia
        $alertas = $this->service->obtenerAlertasAsistencia($this->periodo->id, 70);
        $this->assertCount(1, $alertas);
        $this->assertEquals($this->estudiante->id, $alertas[0]->estudiante_id);
    }

    /** @test */
    public function can_generate_attendance_report_by_date_range()
    {
        $fechaInicio = Carbon::now()->subDays(7);
        $fechaFin = Carbon::now();

        for ($i = 0; $i < 7; $i++) {
            Asistencia::create([
                'estudiante_id' => $this->estudiante->id,
                'fecha' => $fechaInicio->copy()->addDays($i)->format('Y-m-d'),
                'tipo' => $i % 2 == 0 ? 'PRESENTE' : 'AUSENTE',
            ]);
        }

        $reporte = $this->service->generarReporteAsistencia(
            $this->estudiante->id,
            $fechaInicio->format('Y-m-d'),
            $fechaFin->format('Y-m-d')
        );

        $this->assertArrayHasKey('total_dias', $reporte);
        $this->assertArrayHasKey('dias_presente', $reporte);
        $this->assertArrayHasKey('dias_ausente', $reporte);
        $this->assertArrayHasKey('dias_tardanza', $reporte);
        $this->assertArrayHasKey('porcentaje_asistencia', $reporte);

        $this->assertEquals(7, $reporte['total_dias']);
        $this->assertEquals(4, $reporte['dias_presente']);
        $this->assertEquals(3, $reporte['dias_ausente']);
    }

    /** @test */
    public function tardiness_counts_as_present_for_percentage()
    {
        $fechaInicio = Carbon::now()->subDays(3);

        // 2 presentes, 1 tardanza, 1 ausente = 75% asistencia
        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => $fechaInicio->format('Y-m-d'),
            'tipo' => 'PRESENTE',
        ]);

        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => $fechaInicio->copy()->addDay()->format('Y-m-d'),
            'tipo' => 'TARDANZA',
        ]);

        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => $fechaInicio->copy()->addDays(2)->format('Y-m-d'),
            'tipo' => 'PRESENTE',
        ]);

        Asistencia::create([
            'estudiante_id' => $this->estudiante->id,
            'fecha' => $fechaInicio->copy()->addDays(3)->format('Y-m-d'),
            'tipo' => 'AUSENTE',
        ]);

        $porcentaje = $this->service->calcularPorcentajeAsistencia(
            $this->estudiante->id,
            $fechaInicio->format('Y-m-d'),
            $fechaInicio->copy()->addDays(3)->format('Y-m-d')
        );

        $this->assertEquals(75, $porcentaje);
    }
}
