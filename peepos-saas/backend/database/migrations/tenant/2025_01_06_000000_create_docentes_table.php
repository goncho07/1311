<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de docentes con información laboral y académica
     */
    public function up(): void
    {
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->onDelete('cascade');
            $table->string('codigo_docente', 20)->unique();
            $table->string('codigo_modular_docente', 20)->unique()->nullable()->comment('Código MINEDU');
            $table->string('especialidad', 100)->nullable();
            $table->string('titulo_profesional', 150)->nullable();
            $table->string('universidad', 150)->nullable();
            $table->integer('año_titulacion')->nullable();
            $table->string('colegiatura', 50)->nullable()->comment('Número colegiatura profesional');
            $table->enum('nivel_educativo_asignado', ['INICIAL', 'PRIMARIA', 'SECUNDARIA'])->default('SECUNDARIA');
            $table->enum('condicion_laboral', ['NOMBRADO', 'CONTRATADO', 'DESTACADO', 'REASIGNADO']);
            $table->enum('regimen_laboral', ['LEY_276', 'LEY_30328', 'PRIVADO']);
            $table->date('fecha_ingreso');
            $table->date('fecha_cese')->nullable();
            $table->integer('carga_horaria')->default(30)->comment('Horas pedagógicas semanales');
            $table->enum('turno', ['MAÑANA', 'TARDE', 'AMBOS'])->default('MAÑANA');
            $table->boolean('es_tutor')->default(false);
            $table->string('grado_tutor', 5)->nullable();
            $table->string('seccion_tutor', 5)->nullable();
            $table->json('areas_curriculares')->nullable()->comment('Áreas que enseña');
            $table->json('certificaciones')->nullable();
            $table->json('capacitaciones')->nullable();
            $table->json('evaluaciones_desempeño')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['codigo_docente']);
            $table->index(['condicion_laboral']);
            $table->index(['es_tutor']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('docentes');
    }
};
