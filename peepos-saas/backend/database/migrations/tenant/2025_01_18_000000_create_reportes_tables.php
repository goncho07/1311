<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Sistema de reportes y estadísticas
     */
    public function up(): void
    {
        // Tabla: reportes_generados
        Schema::create('reportes_generados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_reporte', 200);
            $table->enum('tipo', ['SIAGIE', 'ASISTENCIA', 'NOTAS', 'MATRICULA', 'FINANZAS', 'DISCIPLINA', 'CUSTOM']);
            $table->enum('formato', ['PDF', 'EXCEL', 'CSV', 'JSON']);
            $table->json('parametros')->comment('Filtros usados: grado, sección, fechas, etc');
            $table->foreignId('periodo_academico_id')->nullable()->constrained('periodos_academicos');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°'])->nullable();
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F'])->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->text('ruta_archivo');
            $table->integer('tamaño_bytes')->nullable();
            $table->enum('estado', ['GENERANDO', 'COMPLETADO', 'ERROR'])->default('GENERANDO');
            $table->text('mensaje_error')->nullable();
            $table->foreignId('generado_por')->constrained('usuarios');
            $table->integer('descargas')->default(0);
            $table->timestamp('fecha_expiracion')->nullable();
            $table->timestamps();

            $table->index(['tipo', 'created_at']);
            $table->index(['generado_por']);
        });

        // Tabla: estadisticas_snapshot
        Schema::create('estadisticas_snapshot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->date('fecha_snapshot');
            $table->enum('tipo', ['DIARIO', 'SEMANAL', 'MENSUAL', 'BIMESTRAL', 'ANUAL']);
            $table->integer('total_estudiantes_activos')->default(0);
            $table->integer('total_docentes_activos')->default(0);
            $table->decimal('promedio_asistencia_general', 5, 2)->default(0.00);
            $table->decimal('promedio_academico_general', 5, 2)->default(0.00);
            $table->integer('total_incidencias_mes')->default(0);
            $table->integer('total_comunicaciones_enviadas')->default(0);
            $table->decimal('porcentaje_morosidad', 5, 2)->default(0.00);
            $table->decimal('monto_cobrado_mes', 12, 2)->default(0.00);
            $table->json('estadisticas_por_grado')->nullable();
            $table->json('estadisticas_detalladas')->nullable();
            $table->timestamps();

            $table->unique(['periodo_academico_id', 'fecha_snapshot', 'tipo']);
            $table->index(['fecha_snapshot', 'tipo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estadisticas_snapshot');
        Schema::dropIfExists('reportes_generados');
    }
};
