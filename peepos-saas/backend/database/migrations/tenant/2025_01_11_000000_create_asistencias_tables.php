<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo de asistencias: registro, horarios y códigos QR
     */
    public function up(): void
    {
        // Tabla: horarios_clases
        Schema::create('horarios_clases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->foreignId('area_curricular_id')->constrained('areas_curriculares');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->enum('dia_semana', ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->integer('numero_bloque')->comment('1ra, 2da, 3ra hora, etc');
            $table->string('aula', 50)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['periodo_academico_id', 'grado', 'seccion', 'dia_semana', 'numero_bloque'], 'uk_horario_unico');
            $table->index(['docente_id', 'dia_semana']);
        });

        // Tabla: asistencias
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('horario_clase_id')->constrained('horarios_clases');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->date('fecha');
            $table->time('hora_registro')->useCurrent();
            $table->enum('estado', ['PRESENTE', 'TARDE', 'AUSENTE', 'JUSTIFICADO'])->default('AUSENTE');
            $table->integer('minutos_tardanza')->default(0);
            $table->enum('tipo_registro', ['MANUAL', 'QR', 'BIOMETRICO', 'AUTOMATICO'])->default('MANUAL');
            $table->text('observaciones')->nullable();
            $table->string('justificacion_archivo')->nullable();
            $table->text('motivo_justificacion')->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('usuarios');
            $table->timestamps();

            $table->unique(['estudiante_id', 'horario_clase_id', 'fecha']);
            $table->index(['fecha', 'estado']);
            $table->index(['estudiante_id', 'fecha']);
        });

        // Tabla: codigos_qr_asistencia
        Schema::create('codigos_qr_asistencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horario_clase_id')->constrained('horarios_clases');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->date('fecha');
            $table->string('codigo_qr')->unique();
            $table->text('qr_image_url')->nullable();
            $table->timestamp('fecha_generacion')->useCurrent();
            $table->timestamp('fecha_expiracion');
            $table->integer('minutos_tolerancia')->default(15);
            $table->boolean('activo')->default(true);
            $table->integer('total_escaneos')->default(0);
            $table->timestamps();

            $table->index(['codigo_qr']);
            $table->index(['horario_clase_id', 'fecha']);
            $table->index(['activo', 'fecha_expiracion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('codigos_qr_asistencia');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('horarios_clases');
    }
};
