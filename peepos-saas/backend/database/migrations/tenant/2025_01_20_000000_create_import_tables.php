<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Sistema de importación masiva con IA (Gemini)
     */
    public function up(): void
    {
        // Tabla: import_batches
        Schema::create('import_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code', 30)->unique();
            $table->enum('tipo_importacion', ['ESTUDIANTES', 'DOCENTES', 'NOTAS', 'ASISTENCIAS', 'INVENTARIO', 'FINANZAS']);
            $table->enum('origen', ['EXCEL', 'CSV', 'IMAGEN_OCR', 'PDF']);
            $table->integer('total_archivos')->default(0);
            $table->integer('total_registros')->default(0);
            $table->integer('procesados')->default(0);
            $table->integer('exitosos')->default(0);
            $table->integer('fallidos')->default(0);
            $table->enum('estado', ['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'COMPLETADO_CON_ERRORES', 'FALLIDO'])->default('PENDIENTE');
            $table->integer('progreso_porcentaje')->default(0);
            $table->timestamp('fecha_inicio')->nullable();
            $table->timestamp('fecha_fin')->nullable();
            $table->integer('tiempo_procesamiento_segundos')->nullable();
            $table->boolean('usa_ia')->default(false)->comment('Si usa Gemini AI para extracción');
            $table->json('configuracion')->nullable();
            $table->text('log_general')->nullable();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->timestamps();

            $table->index(['batch_code']);
            $table->index(['tipo_importacion', 'estado']);
        });

        // Tabla: import_files
        Schema::create('import_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('import_batches')->onDelete('cascade');
            $table->string('nombre_archivo');
            $table->text('ruta_original');
            $table->text('ruta_procesado')->nullable();
            $table->integer('tamaño_bytes')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->integer('numero_hojas')->nullable()->comment('Para Excel/CSV');
            $table->integer('registros_detectados')->default(0);
            $table->integer('registros_procesados')->default(0);
            $table->integer('registros_exitosos')->default(0);
            $table->integer('registros_fallidos')->default(0);
            $table->enum('estado', ['PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'ERROR'])->default('PENDIENTE');
            $table->text('log_errores')->nullable();
            $table->json('metadatos_ia')->nullable()->comment('Respuesta de Gemini AI');
            $table->timestamps();

            $table->index(['batch_id', 'estado']);
        });

        // Tabla: import_records
        Schema::create('import_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('import_batches')->onDelete('cascade');
            $table->foreignId('file_id')->constrained('import_files')->onDelete('cascade');
            $table->integer('fila_numero')->nullable();
            $table->json('datos_originales')->comment('Datos extraídos del archivo');
            $table->json('datos_procesados')->nullable()->comment('Datos después de validación');
            $table->enum('estado', ['PENDIENTE', 'PROCESANDO', 'EXITOSO', 'FALLIDO', 'DUPLICADO'])->default('PENDIENTE');
            $table->text('error_mensaje')->nullable();
            $table->string('entidad_tipo', 50)->nullable()->comment('Estudiante, Docente, etc');
            $table->unsignedBigInteger('entidad_id')->nullable()->comment('ID del registro creado');
            $table->decimal('confianza_ia', 5, 2)->nullable()->comment('0-100% confianza de Gemini');
            $table->boolean('requiere_revision')->default(false);
            $table->timestamps();

            $table->index(['batch_id', 'estado']);
            $table->index(['file_id']);
            $table->index(['entidad_tipo', 'entidad_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_records');
        Schema::dropIfExists('import_files');
        Schema::dropIfExists('import_batches');
    }
};
