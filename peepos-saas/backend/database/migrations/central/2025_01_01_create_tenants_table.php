<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de tenants en BD Central
     * Almacena información de instituciones educativas
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('tenant_code', 50)->unique()->comment('Código único del colegio');
            $table->string('nombre_institucion', 200);
            $table->string('codigo_modular', 10)->unique()->comment('Código MINEDU');
            $table->string('ruc', 11)->unique()->nullable();
            $table->string('database_name', 100)->unique()->comment('Nombre BD del tenant');
            $table->string('database_host', 255)->default('localhost');
            $table->text('direccion')->nullable();
            $table->string('distrito', 100)->nullable();
            $table->string('provincia', 100)->default('Lima');
            $table->string('departamento', 100)->default('Lima');
            $table->string('ugel', 50)->nullable()->comment('UGEL jurisdicción');
            $table->enum('tipo_gestion', ['PUBLICO', 'PRIVADO']);
            $table->enum('nivel_educativo', ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'TODOS'])->default('SECUNDARIA');
            $table->enum('plan_suscripcion', ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])->default('BASIC');
            $table->enum('estado', ['ACTIVO', 'SUSPENDIDO', 'INACTIVO', 'PRUEBA'])->default('PRUEBA');
            $table->integer('max_estudiantes')->default(500);
            $table->integer('max_docentes')->default(50);
            $table->integer('max_storage_gb')->default(10);
            $table->date('fecha_inicio_suscripcion')->nullable();
            $table->date('fecha_fin_suscripcion')->nullable();
            $table->json('configuracion')->nullable()->comment('Config personalizada');
            $table->json('modulos_activos')->nullable()->comment('Módulos habilitados');
            $table->string('logo_url')->nullable();
            $table->string('dominio_personalizado')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_code']);
            $table->index(['codigo_modular']);
            $table->index(['estado']);
            $table->index(['plan_suscripcion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
