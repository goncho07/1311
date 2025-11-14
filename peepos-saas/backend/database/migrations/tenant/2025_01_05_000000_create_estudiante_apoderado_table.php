<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla pivote estudiante-apoderado con permisos y prioridades
     */
    public function up(): void
    {
        Schema::create('estudiante_apoderado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->foreignId('apoderado_id')->constrained('apoderados')->onDelete('cascade');
            $table->enum('tipo_relacion', ['PADRE', 'MADRE', 'TUTOR_LEGAL', 'ABUELO', 'TIO', 'HERMANO', 'OTRO']);
            $table->boolean('es_principal')->default(false)->comment('Apoderado principal para comunicaciones');
            $table->tinyInteger('prioridad_contacto')->default(1)->comment('1 = primer contacto, 2 = segundo, etc');
            $table->boolean('autorizado_recoger')->default(true);
            $table->boolean('autorizado_medico')->default(true);
            $table->boolean('autorizado_imagenes')->default(true);
            $table->boolean('activo')->default(true);
            $table->date('fecha_vinculacion');
            $table->date('fecha_desvinculacion')->nullable();
            $table->timestamps();

            $table->unique(['estudiante_id', 'apoderado_id']);
            $table->index(['estudiante_id', 'es_principal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiante_apoderado');
    }
};
