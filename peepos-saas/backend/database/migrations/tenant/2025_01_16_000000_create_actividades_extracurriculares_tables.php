<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Sistema de actividades extracurriculares y talleres
     */
    public function up(): void
    {
        // Tabla: actividades_extracurriculares
        Schema::create('actividades_extracurriculares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['TALLER', 'CLUB', 'DEPORTE', 'ARTE', 'MUSICA', 'TEATRO', 'DANZA', 'CIENCIA', 'ROBOTICA', 'OTRO']);
            $table->foreignId('docente_responsable_id')->constrained('docentes');
            $table->enum('dia_semana', ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('lugar', 150)->nullable();
            $table->integer('cupo_maximo')->default(30);
            $table->integer('cupo_minimo')->default(10);
            $table->integer('inscritos')->default(0);
            $table->decimal('costo', 8, 2)->default(0.00);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['PLANIFICADA', 'ABIERTA_INSCRIPCION', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'])->default('PLANIFICADA');
            $table->json('materiales_necesarios')->nullable();
            $table->json('objetivos')->nullable();
            $table->text('imagen')->nullable();
            $table->timestamps();

            $table->index(['periodo_academico_id', 'estado']);
            $table->index(['tipo']);
        });

        // Tabla: inscripciones_actividades
        Schema::create('inscripciones_actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades_extracurriculares')->onDelete('cascade');
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->date('fecha_inscripcion');
            $table->enum('estado', ['INSCRITO', 'ACTIVO', 'RETIRADO', 'COMPLETADO'])->default('INSCRITO');
            $table->text('motivo_inscripcion')->nullable();
            $table->date('fecha_retiro')->nullable();
            $table->text('motivo_retiro')->nullable();
            $table->decimal('asistencias', 5, 2)->default(0.00)->comment('Porcentaje asistencia');
            $table->text('evaluacion_final')->nullable();
            $table->boolean('certificado_emitido')->default(false);
            $table->timestamps();

            $table->unique(['actividad_id', 'estudiante_id']);
            $table->index(['estudiante_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones_actividades');
        Schema::dropIfExists('actividades_extracurriculares');
    }
};
