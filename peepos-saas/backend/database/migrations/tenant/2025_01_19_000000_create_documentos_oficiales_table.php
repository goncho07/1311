<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de documentos oficiales generados
     */
    public function up(): void
    {
        Schema::create('documentos_oficiales', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_documento', 50)->unique();
            $table->enum('tipo_documento', [
                'CERTIFICADO_ESTUDIOS',
                'CONSTANCIA_MATRICULA',
                'CONSTANCIA_NOTAS',
                'CONSTANCIA_CONDUCTA',
                'BOLETA_NOTAS',
                'LIBRETA_NOTAS',
                'ACTA_EVALUACION',
                'NOMINA_MATRICULA',
                'FICHA_MATRICULA',
                'RESOLUCION_TRASLADO',
                'CONSTANCIA_VACANTE',
                'OTRO'
            ]);
            $table->foreignId('estudiante_id')->nullable()->constrained('estudiantes');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->string('numero_documento', 100)->nullable();
            $table->date('fecha_emision');
            $table->text('ruta_archivo');
            $table->string('hash_documento')->nullable()->comment('Hash para validación de autenticidad');
            $table->enum('estado', ['BORRADOR', 'EMITIDO', 'ENTREGADO', 'ANULADO'])->default('EMITIDO');
            $table->foreignId('emitido_por')->constrained('usuarios');
            $table->foreignId('entregado_a')->nullable()->constrained('usuarios')->comment('Apoderado que recibe');
            $table->timestamp('fecha_entrega')->nullable();
            $table->text('motivo_anulacion')->nullable();
            $table->foreignId('anulado_por')->nullable()->constrained('usuarios');
            $table->timestamp('fecha_anulacion')->nullable();
            $table->json('metadata')->nullable()->comment('Datos adicionales del documento');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['codigo_documento']);
            $table->index(['tipo_documento', 'estudiante_id']);
            $table->index(['periodo_academico_id']);
            $table->index(['estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentos_oficiales');
    }
};
