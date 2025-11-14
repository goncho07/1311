<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo académico: áreas, competencias, evaluaciones, historial, concursos CyE, tareas
     */
    public function up(): void
    {
        // 1. areas_curriculares
        Schema::create('areas_curriculares', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_minedu', 10)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('horas_semanales_1')->default(0)->comment('Horas 1er grado');
            $table->integer('horas_semanales_2')->default(0);
            $table->integer('horas_semanales_3')->default(0);
            $table->integer('horas_semanales_4')->default(0);
            $table->integer('horas_semanales_5')->default(0);
            $table->string('color_identificacion', 7)->nullable();
            $table->string('icono', 50)->nullable();
            $table->boolean('es_transversal')->default(false);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['codigo_minedu']);
            $table->index(['activo']);
        });

        // 2. competencias_minedu
        Schema::create('competencias_minedu', function (Blueprint $table) {
            $table->id();
            $table->integer('numero_competencia');
            $table->foreignId('area_curricular_id')->constrained('areas_curriculares');
            $table->string('nombre', 200);
            $table->text('descripcion');
            $table->boolean('es_transversal')->default(false);
            $table->enum('ciclo_educativo', ['VI', 'VII']);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['numero_competencia']);
            $table->index(['area_curricular_id']);
        });

        // 3. capacidades_competencias
        Schema::create('capacidades_competencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competencia_id')->constrained('competencias_minedu')->onDelete('cascade');
            $table->string('nombre', 300);
            $table->text('descripcion')->nullable();
            $table->integer('orden')->default(1);
            $table->boolean('activo')->default(true);

            $table->index(['competencia_id']);
        });

        // 4. asignaciones_docente
        Schema::create('asignaciones_docente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained('docentes');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->foreignId('area_curricular_id')->constrained('areas_curriculares');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->enum('turno', ['MAÑANA', 'TARDE']);
            $table->integer('horas_semanales');
            $table->boolean('es_tutor')->default(false);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['docente_id', 'area_curricular_id', 'grado', 'seccion', 'periodo_academico_id'], 'uk_asignacion_unica');
            $table->index(['periodo_academico_id', 'grado', 'seccion']);
            $table->index(['docente_id']);
        });

        // 5. evaluaciones
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->foreignId('area_curricular_id')->constrained('areas_curriculares');
            $table->foreignId('competencia_id')->constrained('competencias_minedu');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->enum('bimestre', ['I', 'II', 'III', 'IV']);
            $table->enum('calificacion', ['AD', 'A', 'B', 'C']);
            $table->decimal('calificacion_numerica', 4, 2)->nullable()->comment('Conversión numérica 0-20');
            $table->date('fecha_evaluacion');
            $table->enum('tipo_evaluacion', ['DIAGNOSTICA', 'FORMATIVA', 'SUMATIVA'])->default('FORMATIVA');
            $table->decimal('peso_evaluacion', 3, 2)->default(1.00);
            $table->text('observaciones')->nullable();
            $table->json('evidencias')->nullable()->comment('URLs de trabajos, fotos, etc');
            $table->timestamps();

            $table->unique(['estudiante_id', 'competencia_id', 'periodo_academico_id', 'bimestre'], 'uk_evaluacion_unica');
            $table->index(['estudiante_id', 'periodo_academico_id']);
            $table->index(['docente_id', 'area_curricular_id']);
            $table->index(['bimestre']);
        });

        // 6. historial_academico
        Schema::create('historial_academico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->decimal('promedio_bimestre_1', 4, 2)->nullable();
            $table->decimal('promedio_bimestre_2', 4, 2)->nullable();
            $table->decimal('promedio_bimestre_3', 4, 2)->nullable();
            $table->decimal('promedio_bimestre_4', 4, 2)->nullable();
            $table->decimal('promedio_anual', 4, 2)->nullable();
            $table->boolean('aprobado')->nullable();
            $table->integer('areas_aprobadas')->default(0);
            $table->integer('areas_desaprobadas')->default(0);
            $table->json('areas_desaprobadas_detalle')->nullable();
            $table->integer('puesto_aula')->nullable();
            $table->integer('puesto_grado')->nullable();
            $table->enum('estado_promocion', ['PROMOVIDO', 'REPITE', 'RECUPERACION'])->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['estudiante_id', 'periodo_academico_id']);
            $table->index(['periodo_academico_id', 'grado']);
            $table->index(['aprobado']);
        });

        // 7. concursos_cye
        Schema::create('concursos_cye', function (Blueprint $table) {
            $table->id();
            $table->enum('categoria', ['A', 'B', 'C']);
            $table->string('nombre_proyecto', 200);
            $table->json('estudiantes_participantes')->comment('Array de IDs estudiantes');
            $table->foreignId('docente_asesor_id')->constrained('docentes');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->text('imagen_proyecto')->nullable();
            $table->string('nombre_equipo', 100)->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['BORRADOR', 'ENVIADO', 'EVALUACION', 'FINALISTA', 'GANADOR', 'DESCALIFICADO'])->default('BORRADOR');
            $table->decimal('puntaje_obtenido', 5, 2)->nullable();
            $table->integer('posicion_final')->nullable();
            $table->json('archivos_adjuntos')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['categoria']);
            $table->index(['estado']);
            $table->index(['periodo_academico_id']);
        });

        // 8. tareas
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_curricular_id')->constrained('areas_curriculares');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->string('titulo', 200);
            $table->text('descripcion');
            $table->enum('tipo', ['TAREA', 'PROYECTO', 'INVESTIGACION', 'LECTURA', 'EXAMEN']);
            $table->date('fecha_asignacion');
            $table->date('fecha_entrega');
            $table->time('hora_entrega')->default('23:59:00');
            $table->decimal('puntaje_maximo', 5, 2)->default(20.00);
            $table->json('archivos_adjuntos')->nullable();
            $table->json('criterios_evaluacion')->nullable();
            $table->boolean('permite_entrega_tardia')->default(false);
            $table->decimal('penalizacion_tardia', 3, 2)->default(0.00)->comment('Puntos descontados por día');
            $table->boolean('visible_estudiantes')->default(true);
            $table->timestamps();

            $table->index(['docente_id', 'fecha_entrega']);
            $table->index(['grado', 'seccion', 'fecha_entrega']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tareas');
        Schema::dropIfExists('concursos_cye');
        Schema::dropIfExists('historial_academico');
        Schema::dropIfExists('evaluaciones');
        Schema::dropIfExists('asignaciones_docente');
        Schema::dropIfExists('capacidades_competencias');
        Schema::dropIfExists('competencias_minedu');
        Schema::dropIfExists('areas_curriculares');
    }
};
