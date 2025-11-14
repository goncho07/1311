<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de apoderados (padres, tutores)
     */
    public function up(): void
    {
        Schema::create('apoderados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->onDelete('cascade');
            $table->string('codigo_apoderado', 20)->unique();
            $table->enum('tipo_apoderado', ['PADRE', 'MADRE', 'TUTOR', 'ABUELO', 'TIO', 'HERMANO', 'OTRO']);
            $table->boolean('vive_con_estudiante')->default(true);
            $table->enum('grado_instruccion', ['SIN_ESTUDIOS', 'PRIMARIA', 'SECUNDARIA', 'TECNICA', 'UNIVERSITARIA', 'POSTGRADO'])->nullable();
            $table->string('ocupacion', 100)->nullable();
            $table->string('centro_trabajo', 150)->nullable();
            $table->string('telefono_trabajo', 15)->nullable();
            $table->string('whatsapp', 15)->nullable();
            $table->boolean('whatsapp_verificado')->default(false);
            $table->enum('preferencia_comunicacion', ['WHATSAPP', 'SMS', 'EMAIL', 'LLAMADA'])->default('WHATSAPP');
            $table->enum('estado_civil', ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'CONVIVIENTE'])->nullable();
            $table->decimal('ingreso_mensual', 10, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['codigo_apoderado']);
            $table->index(['whatsapp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apoderados');
    }
};
