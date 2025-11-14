<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo de comunicaciones: mensajes, reuniones y plantillas
     */
    public function up(): void
    {
        // Tabla: comunicaciones
        Schema::create('comunicaciones', function (Blueprint $table) {
            $table->id();
            $table->string('asunto', 200);
            $table->text('mensaje');
            $table->enum('tipo', ['GENERAL', 'ACADEMICO', 'DISCIPLINARIO', 'EVENTO', 'EMERGENCIA', 'AVISO'])->default('GENERAL');
            $table->enum('canal', ['WHATSAPP', 'EMAIL', 'SMS', 'PLATAFORMA'])->default('PLATAFORMA');
            $table->enum('destinatario_tipo', ['ESTUDIANTE', 'APODERADO', 'DOCENTE', 'TODOS_APODERADOS', 'GRADO', 'SECCION', 'INDIVIDUAL']);
            $table->json('destinatarios_ids')->nullable()->comment('IDs de destinatarios');
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°'])->nullable();
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F'])->nullable();
            $table->foreignId('remitente_id')->constrained('usuarios');
            $table->json('archivos_adjuntos')->nullable();
            $table->boolean('requiere_confirmacion')->default(false);
            $table->timestamp('fecha_programada')->nullable();
            $table->enum('estado', ['BORRADOR', 'PROGRAMADA', 'ENVIADA', 'FALLIDA'])->default('BORRADOR');
            $table->timestamp('fecha_envio')->nullable();
            $table->integer('total_destinatarios')->default(0);
            $table->integer('total_leidos')->default(0);
            $table->integer('total_confirmados')->default(0);
            $table->json('estadisticas_envio')->nullable();
            $table->timestamps();

            $table->index(['estado', 'fecha_programada']);
            $table->index(['destinatario_tipo', 'grado', 'seccion']);
        });

        // Tabla: reuniones_apoderados
        Schema::create('reuniones_apoderados', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['GENERAL', 'POR_GRADO', 'INDIVIDUAL', 'COMITE', 'ENTREGA_NOTAS']);
            $table->enum('grado', ['1°', '2°', '3°', '4°', '5°'])->nullable();
            $table->enum('seccion', ['A', 'B', 'C', 'D', 'E', 'F'])->nullable();
            $table->timestamp('fecha_hora');
            $table->integer('duracion_minutos')->default(60);
            $table->string('lugar', 200);
            $table->enum('modalidad', ['PRESENCIAL', 'VIRTUAL', 'HIBRIDA'])->default('PRESENCIAL');
            $table->text('enlace_virtual')->nullable();
            $table->foreignId('organizador_id')->constrained('usuarios');
            $table->json('agenda')->nullable();
            $table->boolean('requiere_confirmacion')->default(true);
            $table->timestamp('fecha_limite_confirmacion')->nullable();
            $table->integer('total_convocados')->default(0);
            $table->integer('total_confirmados')->default(0);
            $table->integer('total_asistentes')->default(0);
            $table->text('acta_reunion')->nullable();
            $table->json('archivos_adjuntos')->nullable();
            $table->timestamps();

            $table->index(['fecha_hora']);
            $table->index(['tipo', 'grado', 'seccion']);
        });

        // Tabla: plantillas_comunicacion
        Schema::create('plantillas_comunicacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->enum('tipo', ['WHATSAPP', 'EMAIL', 'SMS']);
            $table->enum('categoria', ['ACADEMICO', 'ASISTENCIA', 'DISCIPLINA', 'EVENTO', 'GENERAL']);
            $table->string('asunto', 200)->nullable();
            $table->text('contenido');
            $table->json('variables_disponibles')->nullable()->comment('{{nombre}}, {{grado}}, etc');
            $table->boolean('activo')->default(true);
            $table->integer('veces_usado')->default(0);
            $table->foreignId('creado_por')->constrained('usuarios');
            $table->timestamps();

            $table->index(['tipo', 'categoria']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plantillas_comunicacion');
        Schema::dropIfExists('reuniones_apoderados');
        Schema::dropIfExists('comunicaciones');
    }
};
