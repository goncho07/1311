<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de usuarios administrativos en BD Central
     * Gestiona acceso de directores, coordinadores, etc.
     */
    public function up(): void
    {
        Schema::create('tenant_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('email', 150);
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->enum('rol', ['SUPER_ADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'COORDINADOR', 'SOPORTE']);
            $table->boolean('activo')->default(true);
            $table->json('permisos_adicionales')->nullable();
            $table->timestamp('ultimo_acceso')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'email']);
            $table->index(['email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_users');
    }
};
