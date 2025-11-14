<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de personal administrativo
     */
    public function up(): void
    {
        Schema::create('personal_administrativo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->onDelete('cascade');
            $table->string('codigo_personal', 20)->unique();
            $table->string('cargo', 100);
            $table->string('area', 100);
            $table->enum('tipo_contrato', ['NOMBRADO', 'CONTRATADO', 'CAS', 'LOCACION']);
            $table->date('fecha_ingreso');
            $table->date('fecha_cese')->nullable();
            $table->time('horario_entrada')->nullable();
            $table->time('horario_salida')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_administrativo');
    }
};
