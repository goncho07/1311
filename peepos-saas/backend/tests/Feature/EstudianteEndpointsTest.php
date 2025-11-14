<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Apoderado;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\Grado;
use App\Models\Seccion;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Evaluacion;
use App\Models\Asistencia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Tests de Endpoints del Panel Estudiante
 *
 * Verifica todos los endpoints API del panel de estudiante:
 * - Dashboard del estudiante
 * - Mis notas
 * - Mis tareas
 * - Entregar tarea
 * - Mi horario
 * - Mi asistencia
 * - Próximas evaluaciones
 * - Mi perfil
 * - Actualizar perfil
 * - Descargar boleta
 */
class EstudianteEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Estudiante $estudiante;
    protected PeriodoAcademico $periodo;
    protected Matricula $matricula;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear periodo académico activo
        $this->periodo = PeriodoAcademico::factory()->create([
            'nombre' => '2024',
            'activo' => true,
            'fecha_inicio' => now()->startOfYear(),
            'fecha_fin' => now()->endOfYear(),
        ]);

        // Crear estudiante con usuario
        $this->user = User::factory()->create([
            'email' => 'estudiante@test.com',
            'role' => 'estudiante',
        ]);

        $this->estudiante = Estudiante::factory()->create([
            'user_id' => $this->user->id,
            'nombre_completo' => 'Juan Pérez García',
            'codigo' => 'EST001',
            'tipo_documento' => 'DNI',
            'numero_documento' => '12345678',
        ]);

        // Crear matrícula
        $grado = Grado::factory()->create(['nombre' => '3ro Secundaria']);
        $seccion = Seccion::factory()->create([
            'grado_id' => $grado->id,
            'nombre' => 'A'
        ]);

        $this->matricula = Matricula::factory()->create([
            'estudiante_id' => $this->estudiante->id,
            'periodo_academico_id' => $this->periodo->id,
            'grado_id' => $grado->id,
            'seccion_id' => $seccion->id,
            'estado' => 'MATRICULADO',
        ]);
    }

    /** @test */
    public function estudiante_can_access_dashboard()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'estudiante' => [
                    'nombre_completo',
                    'codigo',
                    'grado',
                    'seccion',
                ],
                'kpis' => [
                    'promedio_general',
                    'asistencia_porcentaje',
                    'tareas_pendientes',
                    'competencias_logradas',
                ],
                'notas_por_area',
                'horario_hoy',
                'tareas_proximas',
                'proximas_evaluaciones',
            ]);

        $this->assertEquals(true, $response['success']);
        $this->assertEquals('Juan Pérez García', $response['estudiante']['nombre_completo']);
    }

    /** @test */
    public function estudiante_can_view_notas()
    {
        // Crear evaluación con nota
        $evaluacion = Evaluacion::factory()->create([
            'periodo_academico_id' => $this->periodo->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
        ]);

        $nota = $evaluacion->notas()->create([
            'estudiante_id' => $this->estudiante->id,
            'calificacion_literal' => 'A',
            'calificacion_numerica' => 16,
            'observaciones' => 'Buen trabajo',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/notas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'notas',
                'promedio_general',
            ]);

        $this->assertEquals(true, $response['success']);
    }

    /** @test */
    public function estudiante_can_view_mis_tareas()
    {
        // Crear docente
        $docente = Docente::factory()->create();

        // Crear tarea
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
            'titulo' => 'Ensayo sobre Fotosíntesis',
            'descripcion' => 'Escribir ensayo',
            'fecha_entrega' => now()->addDays(7),
            'puntos_maximos' => 20,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/tareas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'tareas',
                'total',
            ]);

        $this->assertEquals(true, $response['success']);
        $this->assertGreaterThanOrEqual(1, $response['total']);
    }

    /** @test */
    public function estudiante_can_view_tarea_detalle()
    {
        $docente = Docente::factory()->create();
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
            'titulo' => 'Tarea de Matemáticas',
            'descripcion' => 'Resolver ejercicios',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/v1/estudiante/tareas/{$tarea->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'tarea' => [
                    'id',
                    'titulo',
                    'descripcion',
                    'area',
                    'docente',
                    'tipo',
                    'fecha_entrega',
                    'puntos_maximos',
                ],
                'entrega',
            ]);

        $this->assertEquals('Tarea de Matemáticas', $response['tarea']['titulo']);
    }

    /** @test */
    public function estudiante_can_entregar_tarea()
    {
        Storage::fake('public');

        $docente = Docente::factory()->create();
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
            'fecha_entrega' => now()->addDays(7),
        ]);

        $archivo = UploadedFile::fake()->create('documento.pdf', 1024); // 1MB

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/estudiante/tareas/{$tarea->id}/entregar", [
                'contenido' => 'Este es mi ensayo completo sobre fotosíntesis...',
                'archivos' => [$archivo],
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verificar que la entrega fue creada
        $this->assertDatabaseHas('entregas_tareas', [
            'tarea_id' => $tarea->id,
            'estudiante_id' => $this->estudiante->id,
            'estado' => 'ENTREGADO',
        ]);
    }

    /** @test */
    public function estudiante_cannot_entregar_tarea_sin_contenido()
    {
        $docente = Docente::factory()->create();
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/estudiante/tareas/{$tarea->id}/entregar", [
                'contenido' => '', // Vacío
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function estudiante_cannot_entregar_tarea_mas_de_5_archivos()
    {
        Storage::fake('public');

        $docente = Docente::factory()->create();
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
        ]);

        // Crear 6 archivos
        $archivos = [];
        for ($i = 0; $i < 6; $i++) {
            $archivos[] = UploadedFile::fake()->create("archivo{$i}.pdf", 1024);
        }

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/estudiante/tareas/{$tarea->id}/entregar", [
                'contenido' => 'Contenido de la tarea',
                'archivos' => $archivos,
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function estudiante_cannot_entregar_archivo_mayor_a_10mb()
    {
        Storage::fake('public');

        $docente = Docente::factory()->create();
        $tarea = Tarea::factory()->create([
            'docente_id' => $docente->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
        ]);

        // Crear archivo de 11MB
        $archivoGrande = UploadedFile::fake()->create('archivo.pdf', 11 * 1024);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/estudiante/tareas/{$tarea->id}/entregar", [
                'contenido' => 'Contenido de la tarea',
                'archivos' => [$archivoGrande],
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function estudiante_can_view_horario()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/horario');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'horario',
                'grado',
                'seccion',
            ]);

        $this->assertEquals(true, $response['success']);
    }

    /** @test */
    public function estudiante_can_view_asistencia()
    {
        // Crear asistencias
        Asistencia::factory()->count(5)->create([
            'estudiante_id' => $this->estudiante->id,
            'estado' => 'PRESENTE',
            'fecha' => now()->subDays(rand(1, 10)),
        ]);

        Asistencia::factory()->count(2)->create([
            'estudiante_id' => $this->estudiante->id,
            'estado' => 'FALTA',
            'fecha' => now()->subDays(rand(1, 10)),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/asistencia');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'asistencias',
                'resumen' => [
                    'total_dias',
                    'presentes',
                    'faltas',
                    'tardanzas',
                    'porcentaje_asistencia',
                ],
            ]);

        $this->assertEquals(true, $response['success']);
        $this->assertEquals(5, $response['resumen']['presentes']);
        $this->assertEquals(2, $response['resumen']['faltas']);
    }

    /** @test */
    public function estudiante_can_view_proximas_evaluaciones()
    {
        // Crear evaluaciones futuras
        Evaluacion::factory()->count(3)->create([
            'periodo_academico_id' => $this->periodo->id,
            'grado_id' => $this->matricula->grado_id,
            'seccion_id' => $this->matricula->seccion_id,
            'fecha_evaluacion' => now()->addDays(rand(1, 15)),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/evaluaciones/proximas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'evaluaciones',
                'total',
            ]);

        $this->assertEquals(true, $response['success']);
        $this->assertGreaterThanOrEqual(3, $response['total']);
    }

    /** @test */
    public function estudiante_can_view_perfil()
    {
        // Crear apoderados
        $apoderado = Apoderado::factory()->create();
        $this->estudiante->apoderados()->attach($apoderado->id, [
            'tipo_relacion' => 'Madre',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/perfil');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'estudiante' => [
                    'nombre_completo',
                    'codigo',
                    'tipo_documento',
                    'numero_documento',
                    'fecha_nacimiento',
                    'edad',
                    'genero',
                ],
                'matricula',
                'apoderados',
            ]);

        $this->assertEquals('Juan Pérez García', $response['estudiante']['nombre_completo']);
        $this->assertCount(1, $response['apoderados']);
    }

    /** @test */
    public function estudiante_can_update_foto_perfil()
    {
        Storage::fake('public');

        $foto = UploadedFile::fake()->image('perfil.jpg', 800, 800);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/estudiante/perfil', [
                'foto_perfil' => $foto,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verificar que el archivo fue guardado
        $this->estudiante->refresh();
        $this->assertNotNull($this->estudiante->foto_perfil);
        Storage::disk('public')->assertExists($this->estudiante->foto_perfil);
    }

    /** @test */
    public function estudiante_cannot_upload_foto_mayor_a_5mb()
    {
        Storage::fake('public');

        // Crear imagen de 6MB
        $fotoGrande = UploadedFile::fake()->create('perfil.jpg', 6 * 1024);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/estudiante/perfil', [
                'foto_perfil' => $fotoGrande,
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function estudiante_cannot_upload_archivo_no_imagen()
    {
        Storage::fake('public');

        $pdf = UploadedFile::fake()->create('documento.pdf', 1024);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/estudiante/perfil', [
                'foto_perfil' => $pdf,
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function estudiante_can_download_boleta()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/estudiante/boleta/descargar?' . http_build_query([
                'periodo_id' => $this->periodo->id,
                'bimestre' => '1',
            ]));

        // Debería retornar un PDF
        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
    }

    /** @test */
    public function guest_cannot_access_estudiante_endpoints()
    {
        $response = $this->getJson('/api/v1/estudiante/dashboard');
        $response->assertStatus(401); // Unauthorized

        $response = $this->getJson('/api/v1/estudiante/notas');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v1/estudiante/perfil');
        $response->assertStatus(401);
    }

    /** @test */
    public function docente_cannot_access_estudiante_endpoints()
    {
        $docenteUser = User::factory()->create(['role' => 'docente']);

        $response = $this->actingAs($docenteUser, 'sanctum')
            ->getJson('/api/v1/estudiante/dashboard');

        $response->assertStatus(403); // Forbidden
    }
}
