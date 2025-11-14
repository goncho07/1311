<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla principal de usuarios en BD Tenant
     * Almacena todos los usuarios: estudiantes, docentes, apoderados, administrativos
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->enum('tipo_usuario', ['ESTUDIANTE', 'DOCENTE', 'APODERADO', 'ADMINISTRATIVO', 'DIRECTIVO']);
            $table->string('codigo_usuario', 20)->unique();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('nombre_completo', 200)->storedAs("CONCAT(apellidos, ', ', nombres)");
            $table->string('dni', 8)->unique()->nullable();
            $table->string('email', 150)->unique()->nullable();
            $table->timestamp('email_verificado_at')->nullable();
            $table->string('telefono', 15)->nullable();
            $table->string('celular', 15)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('genero', ['M', 'F', 'OTRO'])->nullable();
            $table->text('direccion')->nullable();
            $table->string('distrito', 100)->nullable();
            $table->text('foto_perfil')->nullable();
            $table->string('password');
            $table->string('google_id', 100)->nullable();
            $table->timestamp('ultimo_acceso')->nullable();
            $table->integer('intentos_fallidos')->default(0);
            $table->timestamp('bloqueado_hasta')->nullable();
            $table->enum('estado', ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])->default('ACTIVO');
            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('created_by')->nullable()->constrained('usuarios');
            $table->foreignId('updated_by')->nullable()->constrained('usuarios');

            $table->index(['tipo_usuario']);
            $table->index(['dni']);
            $table->index(['email']);
            $table->index(['estado']);
            $table->fullText(['nombres', 'apellidos']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
