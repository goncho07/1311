<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Sistema de roles y permisos RBAC
     */
    public function up(): void
    {
        // Tabla: roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->string('slug', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->integer('nivel_jerarquia')->default(0);
            $table->json('permisos')->nullable();
            $table->boolean('es_sistema')->default(false);
            $table->timestamps();
        });

        // Tabla: permisos
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->enum('modulo', ['USUARIOS', 'MATRICULA', 'ACADEMICO', 'ASISTENCIA', 'COMUNICACIONES', 'RECURSOS', 'REPORTES', 'FINANZAS', 'CONFIGURACION']);
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->index(['modulo']);
        });

        // Tabla: usuario_rol
        Schema::create('usuario_rol', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('rol_id')->constrained('roles')->onDelete('cascade');
            $table->timestamp('fecha_asignacion')->useCurrent();
            $table->foreignId('asignado_por')->nullable()->constrained('usuarios');

            $table->unique(['usuario_id', 'rol_id']);
        });

        // Tabla: rol_permiso
        Schema::create('rol_permiso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rol_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permiso_id')->constrained('permisos')->onDelete('cascade');

            $table->unique(['rol_id', 'permiso_id']);
        });

        // Tabla: sesiones
        Schema::create('sesiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('dispositivo', 100)->nullable();
            $table->string('navegador', 100)->nullable();
            $table->string('ubicacion_geografica', 200)->nullable();
            $table->timestamp('fecha_inicio')->useCurrent();
            $table->timestamp('fecha_ultimo_uso')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('fecha_expiracion');
            $table->boolean('activa')->default(true);

            $table->index(['token']);
            $table->index(['usuario_id', 'activa']);
        });

        // Tabla: registro_actividad (Audit log)
        Schema::create('registro_actividad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('accion', 100);
            $table->string('modulo', 50);
            $table->string('entidad_tipo', 50)->nullable();
            $table->unsignedBigInteger('entidad_id')->nullable();
            $table->text('descripcion')->nullable();
            $table->json('datos_anteriores')->nullable();
            $table->json('datos_nuevos')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['usuario_id', 'created_at']);
            $table->index(['modulo', 'accion']);
            $table->index(['entidad_tipo', 'entidad_id']);
        });

        // Tabla: notificaciones_sistema
        Schema::create('notificaciones_sistema', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->enum('tipo', ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'URGENTE']);
            $table->string('titulo', 200);
            $table->text('mensaje');
            $table->text('accion_url')->nullable();
            $table->string('icono', 50)->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_leida')->nullable();
            $table->boolean('archivada')->default(false);
            $table->timestamp('fecha_archivada')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['usuario_id', 'leida']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones_sistema');
        Schema::dropIfExists('registro_actividad');
        Schema::dropIfExists('sesiones');
        Schema::dropIfExists('rol_permiso');
        Schema::dropIfExists('usuario_rol');
        Schema::dropIfExists('permisos');
        Schema::dropIfExists('roles');
    }
};
