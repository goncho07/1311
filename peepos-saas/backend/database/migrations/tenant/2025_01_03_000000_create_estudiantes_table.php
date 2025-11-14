<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de estudiantes con información académica y de salud
     */
    public function up(): void
    {
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->onDelete('cascade');
            $table->string('codigo_estudiante', 20)->unique();
            $table->string('codigo_siagie', 20)->unique()->nullable();
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°']);
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F']);
            $table->enum('turno', ['MAÑANA', 'TARDE']);
            $table->enum('nivel_educativo', ['INICIAL', 'PRIMARIA', 'SECUNDARIA'])->default('SECUNDARIA');
            $table->date('fecha_ingreso');
            $table->date('fecha_egreso')->nullable();
            $table->enum('tipo_ingreso', ['REGULAR', 'TRASLADO', 'EXONERADO'])->default('REGULAR');
            $table->enum('situacion', ['MATRICULADO', 'TRASLADADO', 'RETIRADO', 'CULMINO'])->default('MATRICULADO');
            $table->string('lugar_nacimiento', 100)->nullable();
            $table->string('lengua_materna', 50)->nullable();
            $table->string('religion', 50)->nullable();
            $table->string('tipo_discapacidad', 100)->nullable();
            $table->string('certificado_discapacidad', 100)->nullable();
            $table->enum('seguro_salud', ['ESSALUD', 'SIS', 'PRIVADO', 'NINGUNO'])->nullable();
            $table->string('numero_seguro', 50)->nullable();
            $table->enum('grupo_sanguineo', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->text('alergias')->nullable();
            $table->text('condiciones_medicas')->nullable();
            $table->text('medicacion_actual')->nullable();
            $table->string('contacto_emergencia_nombre', 100)->nullable();
            $table->string('contacto_emergencia_telefono', 15)->nullable();
            $table->string('contacto_emergencia_parentesco', 50)->nullable();
            $table->json('datos_adicionales')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['grado', 'seccion']);
            $table->index(['codigo_estudiante']);
            $table->index(['situacion']);
            $table->index(['turno']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};
