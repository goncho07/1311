<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de entregas de tareas por estudiantes
     */
    public function up(): void
    {
        Schema::create('entregas_tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tarea_id')->constrained('tareas')->onDelete('cascade');
            $table->foreignId('estudiante_id')->constrained('estudiantes')->onDelete('cascade');
            $table->timestamp('fecha_entrega')->useCurrent();
            $table->boolean('entrega_tardia')->default(false);
            $table->integer('dias_retraso')->default(0);
            $table->text('comentario_estudiante')->nullable();
            $table->json('archivos_entregados')->nullable();
            $table->enum('estado_revision', ['PENDIENTE', 'REVISADA', 'DEVUELTA'])->default('PENDIENTE');
            $table->decimal('calificacion', 5, 2)->nullable();
            $table->text('retroalimentacion_docente')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('docentes');
            $table->boolean('permite_reentrega')->default(false);
            $table->integer('numero_intento')->default(1);
            $table->timestamps();

            $table->unique(['tarea_id', 'estudiante_id', 'numero_intento']);
            $table->index(['estudiante_id', 'estado_revision']);
            $table->index(['tarea_id', 'estado_revision']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entregas_tareas');
    }
};
