<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de incidencias disciplinarias de estudiantes
     */
    public function up(): void
    {
        Schema::create('incidencias_disciplinarias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('reportado_por')->constrained('usuarios');
            $table->date('fecha_incidencia');
            $table->time('hora_incidencia')->nullable();
            $table->enum('tipo', ['CONDUCTA', 'ACADEMICA', 'ASISTENCIA', 'UNIFORME', 'AGRESION', 'BULLYING', 'OTRO']);
            $table->enum('gravedad', ['LEVE', 'MODERADA', 'GRAVE', 'MUY_GRAVE']);
            $table->string('titulo', 200);
            $table->text('descripcion');
            $table->string('lugar_incidencia', 100)->nullable();
            $table->json('testigos')->nullable()->comment('IDs de estudiantes o docentes testigos');
            $table->enum('medida_tomada', ['AMONESTACION_VERBAL', 'AMONESTACION_ESCRITA', 'CITACION_APODERADO', 'SUSPENSION', 'CONDICIONAL', 'RETIRO', 'NINGUNA'])->nullable();
            $table->text('descripcion_medida')->nullable();
            $table->boolean('apoderado_notificado')->default(false);
            $table->timestamp('fecha_notificacion_apoderado')->nullable();
            $table->boolean('apoderado_confirmo')->default(false);
            $table->text('comentario_apoderado')->nullable();
            $table->json('archivos_evidencia')->nullable();
            $table->enum('estado', ['ABIERTA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'])->default('ABIERTA');
            $table->text('seguimiento')->nullable();
            $table->foreignId('cerrado_por')->nullable()->constrained('usuarios');
            $table->timestamp('fecha_cierre')->nullable();
            $table->timestamps();

            $table->index(['estudiante_id', 'fecha_incidencia']);
            $table->index(['tipo', 'gravedad']);
            $table->index(['estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidencias_disciplinarias');
    }
};
