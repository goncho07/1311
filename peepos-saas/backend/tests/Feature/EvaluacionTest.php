<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Estudiante;
use App\Models\Evaluacion;
use App\Models\TipoEvaluacion;
use App\Models\Nota;
use App\Models\PeriodoAcademico;
use App\Services\Evaluacion\EvaluacionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de Evaluaciones y Notas
 *
 * Verifica el sistema de evaluaciones:
 * - Creación de evaluaciones
 * - Registro de notas
 * - Cálculo de promedios
 * - Validaciones de escala
 * - Reportes de rendimiento
 */
class EvaluacionTest extends TestCase
{
    use RefreshDatabase;

    protected EvaluacionService $service;
    protected Estudiante $estudiante;
    protected PeriodoAcademico $periodo;
    protected TipoEvaluacion $tipoEvaluacion;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(EvaluacionService::class);

        $this->periodo = PeriodoAcademico::factory()->create(['activo' => true]);
        $this->estudiante = Estudiante::factory()->create();

        $this->tipoEvaluacion = TipoEvaluacion::create([
            'nombre' => 'Examen Parcial',
            'codigo' => 'EP',
            'peso' => 30,
            'descripcion' => 'Examen parcial del bimestre'
        ]);
    }

    /** @test */
    public function can_create_evaluation()
    {
        $evaluacion = Evaluacion::create([
            'periodo_academico_id' => $this->periodo->id,
            'tipo_evaluacion_id' => $this->tipoEvaluacion->id,
            'materia' => 'Matemáticas',
            'grado' => '5°',
            'seccion' => 'A',
            'fecha_evaluacion' => now(),
            'escala_minima' => 0,
            'escala_maxima' => 20,
            'nota_minima_aprobatoria' => 11,
        ]);

        $this->assertInstanceOf(Evaluacion::class, $evaluacion);
        $this->assertEquals('Matemáticas', $evaluacion->materia);
        $this->assertEquals(20, $evaluacion->escala_maxima);
    }

    /** @test */
    public function can_register_student_grade()
    {
        $evaluacion = Evaluacion::factory()->create([
            'escala_minima' => 0,
            'escala_maxima' => 20,
            'nota_minima_aprobatoria' => 11,
        ]);

        $nota = $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 15.5,
            'observaciones' => 'Buen desempeño'
        ]);

        $this->assertInstanceOf(Nota::class, $nota);
        $this->assertEquals(15.5, $nota->nota);
        $this->assertEquals('APROBADO', $nota->estado);
        $this->assertEquals('Buen desempeño', $nota->observaciones);
    }

    /** @test */
    public function validates_grade_within_scale()
    {
        $evaluacion = Evaluacion::factory()->create([
            'escala_minima' => 0,
            'escala_maxima' => 20,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('La nota debe estar entre 0 y 20');

        $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 25, // Fuera de escala
        ]);
    }

    /** @test */
    public function calculates_grade_status_correctly()
    {
        $evaluacion = Evaluacion::factory()->create([
            'escala_minima' => 0,
            'escala_maxima' => 20,
            'nota_minima_aprobatoria' => 11,
        ]);

        // Nota aprobatoria
        $notaAprobada = $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 15,
        ]);

        $this->assertEquals('APROBADO', $notaAprobada->estado);

        // Nota desaprobatoria
        $estudiante2 = Estudiante::factory()->create();
        $notaDesaprobada = $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $estudiante2->id,
            'nota' => 8,
        ]);

        $this->assertEquals('DESAPROBADO', $notaDesaprobada->estado);
    }

    /** @test */
    public function can_calculate_student_average()
    {
        $evaluacion1 = Evaluacion::factory()->create(['peso' => 30]);
        $evaluacion2 = Evaluacion::factory()->create(['peso' => 40]);
        $evaluacion3 = Evaluacion::factory()->create(['peso' => 30]);

        Nota::create([
            'evaluacion_id' => $evaluacion1->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 15,
            'estado' => 'APROBADO'
        ]);

        Nota::create([
            'evaluacion_id' => $evaluacion2->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 18,
            'estado' => 'APROBADO'
        ]);

        Nota::create([
            'evaluacion_id' => $evaluacion3->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 12,
            'estado' => 'APROBADO'
        ]);

        $promedio = $this->service->calcularPromedioEstudiante(
            $this->estudiante->id,
            $this->periodo->id,
            'Matemáticas'
        );

        // Promedio ponderado: (15*0.30 + 18*0.40 + 12*0.30) = 15.3
        $this->assertEquals(15.3, $promedio);
    }

    /** @test */
    public function can_update_existing_grade()
    {
        $evaluacion = Evaluacion::factory()->create();

        $nota = Nota::create([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 12,
            'estado' => 'APROBADO'
        ]);

        $notaActualizada = $this->service->actualizarNota($nota->id, [
            'nota' => 16,
            'observaciones' => 'Corrección aplicada'
        ]);

        $this->assertEquals(16, $notaActualizada->nota);
        $this->assertEquals('Corrección aplicada', $notaActualizada->observaciones);
        $this->assertNotNull($notaActualizada->fecha_modificacion);
    }

    /** @test */
    public function cannot_register_duplicate_grade()
    {
        $evaluacion = Evaluacion::factory()->create();

        // Primera nota
        Nota::create([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 15,
            'estado' => 'APROBADO'
        ]);

        // Intentar registrar segunda nota para el mismo estudiante
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Ya existe una nota registrada para este estudiante en esta evaluación');

        $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 18,
        ]);
    }

    /** @test */
    public function can_get_student_report_card()
    {
        // Crear múltiples evaluaciones y notas
        for ($i = 1; $i <= 4; $i++) {
            $evaluacion = Evaluacion::factory()->create([
                'periodo_academico_id' => $this->periodo->id,
                'materia' => 'Matemáticas',
            ]);

            Nota::create([
                'evaluacion_id' => $evaluacion->id,
                'estudiante_id' => $this->estudiante->id,
                'nota' => 14 + $i,
                'estado' => 'APROBADO'
            ]);
        }

        $reportCard = $this->service->obtenerBoletaNotas(
            $this->estudiante->id,
            $this->periodo->id
        );

        $this->assertIsArray($reportCard);
        $this->assertArrayHasKey('estudiante', $reportCard);
        $this->assertArrayHasKey('notas', $reportCard);
        $this->assertArrayHasKey('promedio_general', $reportCard);
        $this->assertCount(4, $reportCard['notas']);
    }

    /** @test */
    public function marks_failed_students_for_remedial()
    {
        $evaluacion = Evaluacion::factory()->create([
            'nota_minima_aprobatoria' => 11,
        ]);

        $notaDesaprobada = $this->service->registrarNota([
            'evaluacion_id' => $evaluacion->id,
            'estudiante_id' => $this->estudiante->id,
            'nota' => 8,
        ]);

        $this->assertEquals('DESAPROBADO', $notaDesaprobada->estado);
        $this->assertTrue($notaDesaprobada->requiere_recuperacion);
    }
}
