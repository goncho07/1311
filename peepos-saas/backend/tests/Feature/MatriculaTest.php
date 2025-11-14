<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\CupoDisponible;
use App\Services\Matricula\MatriculaService;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de Matrícula
 *
 * Verifica el proceso completo de matrícula:
 * - Creación de matrículas
 * - Control de cupos
 * - Validaciones de negocio
 * - Estados de matrícula
 * - Transferencias y retiros
 */
class MatriculaTest extends TestCase
{
    use RefreshDatabase;

    protected MatriculaService $service;
    protected PeriodoAcademico $periodo;
    protected Estudiante $estudiante;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(MatriculaService::class);

        // Crear periodo académico activo
        $this->periodo = PeriodoAcademico::factory()->create([
            'nombre' => '2024',
            'fecha_inicio' => now()->subMonths(1),
            'fecha_fin' => now()->addMonths(11),
            'activo' => true
        ]);

        // Crear estudiante de prueba
        $this->estudiante = Estudiante::factory()->create([
            'nombres' => 'Juan Carlos',
            'apellido_paterno' => 'Pérez',
            'apellido_materno' => 'García',
            'dni' => '12345678',
            'fecha_nacimiento' => now()->subYears(10),
        ]);
    }

    /** @test */
    public function can_create_matricula_with_available_cupo()
    {
        // Crear cupo disponible
        $cupo = CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        // Crear matrícula
        $matricula = $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);

        // Assertions
        $this->assertInstanceOf(Matricula::class, $matricula);
        $this->assertEquals('SOLICITADA', $matricula->estado);
        $this->assertEquals($this->estudiante->id, $matricula->estudiante_id);
        $this->assertEquals($this->periodo->id, $matricula->periodo_academico_id);

        // Verificar que se actualizó el cupo
        $cupo->refresh();
        $this->assertEquals(1, $cupo->cupos_ocupados);
        $this->assertEquals(29, $cupo->cupos_disponibles);
    }

    /** @test */
    public function cannot_create_matricula_without_cupos()
    {
        // Crear cupo sin disponibilidad
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 1,
            'cupos_ocupados' => 1 // Sin cupos disponibles
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No hay cupos disponibles');

        $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);
    }

    /** @test */
    public function cannot_create_duplicate_matricula_for_same_period()
    {
        // Crear cupo
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        // Primera matrícula
        $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);

        // Intentar crear segunda matrícula para el mismo periodo
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El estudiante ya tiene una matrícula activa para este periodo');

        $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'B',
            'turno' => 'TARDE',
            'tipo_matricula' => 'NUEVA'
        ]);
    }

    /** @test */
    public function can_approve_pending_matricula()
    {
        // Crear cupo
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        // Crear matrícula
        $matricula = $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);

        // Aprobar matrícula
        $matricula = $this->service->aprobarMatricula($matricula->id);

        $this->assertEquals('APROBADA', $matricula->estado);
        $this->assertNotNull($matricula->fecha_aprobacion);
    }

    /** @test */
    public function can_reject_pending_matricula()
    {
        // Crear cupo
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        // Crear matrícula
        $matricula = $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);

        $cupoAntes = CupoDisponible::first();
        $ocupadosAntes = $cupoAntes->cupos_ocupados;

        // Rechazar matrícula
        $matricula = $this->service->rechazarMatricula($matricula->id, 'Documentación incompleta');

        $this->assertEquals('RECHAZADA', $matricula->estado);
        $this->assertEquals('Documentación incompleta', $matricula->motivo_rechazo);

        // Verificar que se liberó el cupo
        $cupoAntes->refresh();
        $this->assertEquals($ocupadosAntes - 1, $cupoAntes->cupos_ocupados);
    }

    /** @test */
    public function can_retire_student()
    {
        // Crear y aprobar matrícula
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        $matricula = $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);

        $matricula = $this->service->aprobarMatricula($matricula->id);

        // Retirar estudiante
        $matricula = $this->service->retirarEstudiante(
            $matricula->id,
            'Cambio de ciudad',
            now()
        );

        $this->assertEquals('RETIRADO', $matricula->estado);
        $this->assertEquals('Cambio de ciudad', $matricula->motivo_retiro);
        $this->assertNotNull($matricula->fecha_retiro);

        // Verificar que se liberó el cupo
        $cupo = CupoDisponible::first();
        $this->assertEquals(0, $cupo->cupos_ocupados);
    }

    /** @test */
    public function matricula_ratificacion_requires_previous_enrollment()
    {
        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '2°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        // Intentar crear matrícula de ratificación sin matrícula previa
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No existe matrícula previa para ratificación');

        $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '2°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'RATIFICACION'
        ]);
    }

    /** @test */
    public function validates_student_age_for_grade()
    {
        // Estudiante muy joven para el grado
        $estudianteJoven = Estudiante::factory()->create([
            'fecha_nacimiento' => now()->subYears(3), // 3 años
        ]);

        CupoDisponible::create([
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '5°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('La edad del estudiante no es apropiada para este grado');

        $this->service->procesarMatricula([
            'estudiante_id' => $estudianteJoven->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado' => '5°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);
    }

    /** @test */
    public function cannot_matriculate_in_inactive_period()
    {
        // Crear periodo inactivo
        $periodoInactivo = PeriodoAcademico::factory()->create([
            'activo' => false
        ]);

        CupoDisponible::create([
            'periodo_academico_id' => $periodoInactivo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'cupos_totales' => 30,
            'cupos_ocupados' => 0
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El periodo académico no está activo');

        $this->service->procesarMatricula([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $periodoInactivo->id,
            'grado' => '1°',
            'seccion' => 'A',
            'turno' => 'MAÑANA',
            'tipo_matricula' => 'NUEVA'
        ]);
    }
}
