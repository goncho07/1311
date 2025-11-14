<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo de matrícula: períodos académicos, matrículas, documentos y cupos
     */
    public function up(): void
    {
        // Tabla: periodos_academicos
        Schema::create('periodos_academicos', function (Blueprint $table) {
            $table->id();
            $table->integer('año');
            $table->string('nombre', 50);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(false);
            $table->json('configuracion')->nullable()->comment('Fechas bimestres, vacaciones, etc');
            $table->timestamps();

            $table->unique(['año']);
            $table->index(['activo']);
        });

        // Tabla: matriculas
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_matricula', 30)->unique();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->enum('turno', ['MAÑANA', 'TARDE']);
            $table->date('fecha_matricula');
            $table->enum('tipo_matricula', ['NUEVA', 'RATIFICACION', 'TRASLADO']);
            $table->enum('modalidad', ['PRESENCIAL', 'SEMIPRESENCIAL', 'DISTANCIA'])->default('PRESENCIAL');
            $table->enum('estado', ['SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA', 'CONFIRMADA'])->default('SOLICITADA');
            $table->text('motivo_rechazo')->nullable();
            $table->boolean('requiere_documentos_adicionales')->default(false);
            $table->json('documentos_pendientes')->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('matriculado_por')->nullable()->constrained('usuarios');
            $table->date('fecha_aprobacion')->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('usuarios');
            $table->timestamps();

            $table->unique(['estudiante_id', 'periodo_academico_id']);
            $table->index(['estado']);
            $table->index(['grado', 'seccion']);
            $table->index(['fecha_matricula']);
        });

        // Tabla: documentos_matricula
        Schema::create('documentos_matricula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matricula_id')->constrained('matriculas')->onDelete('cascade');
            $table->enum('tipo_documento', ['PARTIDA_NACIMIENTO', 'DNI', 'CERTIFICADO_ESTUDIOS', 'LIBRETA_NOTAS', 'RESOLUCION_TRASLADO', 'FICHA_MATRICULA', 'FOTO', 'OTRO']);
            $table->string('nombre_archivo');
            $table->text('ruta_archivo');
            $table->integer('tamaño_bytes')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->enum('estado', ['PENDIENTE', 'VALIDADO', 'RECHAZADO'])->default('PENDIENTE');
            $table->timestamp('fecha_subida')->useCurrent();
            $table->foreignId('validado_por')->nullable()->constrained('usuarios');
            $table->timestamp('fecha_validacion')->nullable();
            $table->text('observaciones')->nullable();

            $table->index(['matricula_id', 'tipo_documento']);
            $table->index(['estado']);
        });

        // Tabla: cupos_disponibles
        Schema::create('cupos_disponibles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->enum('turno', ['MAÑANA', 'TARDE']);
            $table->integer('cupos_totales');
            $table->integer('cupos_ocupados')->default(0);
            $table->integer('cupos_disponibles')->storedAs('cupos_totales - cupos_ocupados');
            $table->timestamps();

            $table->unique(['periodo_academico_id', 'grado', 'seccion', 'turno']);
            $table->index(['cupos_disponibles']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cupos_disponibles');
        Schema::dropIfExists('documentos_matricula');
        Schema::dropIfExists('matriculas');
        Schema::dropIfExists('periodos_academicos');
    }
};
