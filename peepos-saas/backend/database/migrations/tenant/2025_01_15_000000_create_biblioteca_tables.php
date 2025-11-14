<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Sistema de biblioteca escolar
     */
    public function up(): void
    {
        // Tabla: biblioteca_recursos
        Schema::create('biblioteca_recursos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_recurso', 30)->unique();
            $table->enum('tipo', ['LIBRO', 'REVISTA', 'PERIODICO', 'MULTIMEDIA', 'DIGITAL', 'OTRO']);
            $table->string('titulo', 300);
            $table->string('autor', 200)->nullable();
            $table->string('editorial', 150)->nullable();
            $table->string('isbn', 20)->nullable();
            $table->integer('año_publicacion')->nullable();
            $table->integer('edicion')->nullable();
            $table->integer('numero_paginas')->nullable();
            $table->string('idioma', 50)->default('Español');
            $table->enum('categoria', ['TEXTO_ESCOLAR', 'LITERATURA', 'CIENCIA', 'HISTORIA', 'ARTE', 'DEPORTES', 'REFERENCIA', 'OTRO']);
            $table->text('descripcion')->nullable();
            $table->string('ubicacion_fisica', 100)->nullable();
            $table->integer('cantidad_total')->default(1);
            $table->integer('cantidad_disponible')->default(1);
            $table->integer('cantidad_prestada')->default(0);
            $table->enum('estado', ['DISPONIBLE', 'PRESTADO', 'EXTRAVIADO', 'DETERIORADO', 'BAJA'])->default('DISPONIBLE');
            $table->text('imagen_portada')->nullable();
            $table->timestamps();

            $table->index(['codigo_recurso']);
            $table->index(['tipo', 'categoria']);
            $table->index(['estado']);
        });

        // Tabla: prestamos_biblioteca
        Schema::create('prestamos_biblioteca', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recurso_id')->constrained('biblioteca_recursos');
            $table->foreignId('estudiante_id')->nullable()->constrained('estudiantes');
            $table->foreignId('docente_id')->nullable()->constrained('docentes');
            $table->date('fecha_prestamo');
            $table->date('fecha_devolucion_esperada');
            $table->date('fecha_devolucion_real')->nullable();
            $table->integer('dias_prestamo')->default(7);
            $table->integer('dias_retraso')->default(0);
            $table->enum('estado', ['ACTIVO', 'DEVUELTO', 'VENCIDO', 'RENOVADO', 'EXTRAVIADO'])->default('ACTIVO');
            $table->text('observaciones_prestamo')->nullable();
            $table->text('observaciones_devolucion')->nullable();
            $table->enum('estado_recurso_devuelto', ['BUENO', 'DETERIORADO', 'DAÑADO'])->nullable();
            $table->decimal('multa', 8, 2)->default(0.00);
            $table->boolean('multa_pagada')->default(false);
            $table->foreignId('prestado_por')->constrained('usuarios');
            $table->foreignId('recibido_por')->nullable()->constrained('usuarios');
            $table->timestamps();

            $table->index(['estudiante_id', 'estado']);
            $table->index(['recurso_id', 'estado']);
            $table->index(['fecha_devolucion_esperada', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestamos_biblioteca');
        Schema::dropIfExists('biblioteca_recursos');
    }
};
