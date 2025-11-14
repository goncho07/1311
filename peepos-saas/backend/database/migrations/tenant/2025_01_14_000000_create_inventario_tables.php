<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo de inventario institucional
     */
    public function up(): void
    {
        // Tabla: inventario_institucional
        Schema::create('inventario_institucional', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_inventario', 30)->unique();
            $table->string('codigo_patrimonial', 50)->unique()->nullable();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->enum('categoria', ['MOBILIARIO', 'EQUIPO_COMPUTO', 'EQUIPO_LABORATORIO', 'LIBROS', 'MATERIAL_DIDACTICO', 'DEPORTIVO', 'HERRAMIENTAS', 'OTRO']);
            $table->string('marca', 100)->nullable();
            $table->string('modelo', 100)->nullable();
            $table->string('serie', 100)->nullable();
            $table->integer('cantidad')->default(1);
            $table->decimal('valor_unitario', 10, 2)->nullable();
            $table->decimal('valor_total', 10, 2)->nullable();
            $table->date('fecha_adquisicion')->nullable();
            $table->string('proveedor', 200)->nullable();
            $table->enum('estado', ['NUEVO', 'BUENO', 'REGULAR', 'MALO', 'INOPERATIVO', 'BAJA'])->default('BUENO');
            $table->string('ubicacion', 200)->nullable();
            $table->foreignId('responsable_id')->nullable()->constrained('usuarios');
            $table->text('observaciones')->nullable();
            $table->json('imagenes')->nullable();
            $table->timestamps();

            $table->index(['codigo_inventario']);
            $table->index(['categoria', 'estado']);
        });

        // Tabla: movimientos_inventario
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_inventario_id')->constrained('inventario_institucional');
            $table->enum('tipo_movimiento', ['INGRESO', 'SALIDA', 'TRASLADO', 'ASIGNACION', 'DEVOLUCION', 'BAJA']);
            $table->date('fecha_movimiento');
            $table->integer('cantidad')->default(1);
            $table->string('origen', 200)->nullable();
            $table->string('destino', 200)->nullable();
            $table->foreignId('responsable_origen')->nullable()->constrained('usuarios');
            $table->foreignId('responsable_destino')->nullable()->constrained('usuarios');
            $table->text('motivo')->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('registrado_por')->constrained('usuarios');
            $table->timestamps();

            $table->index(['item_inventario_id', 'fecha_movimiento']);
            $table->index(['tipo_movimiento']);
        });

        // Tabla: mantenimientos
        Schema::create('mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_inventario_id')->constrained('inventario_institucional');
            $table->enum('tipo', ['PREVENTIVO', 'CORRECTIVO', 'REVISION']);
            $table->date('fecha_mantenimiento');
            $table->text('descripcion_problema')->nullable();
            $table->text('trabajo_realizado');
            $table->string('tecnico_responsable', 150)->nullable();
            $table->string('empresa_servicio', 200)->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->date('proxima_revision')->nullable();
            $table->json('repuestos_usados')->nullable();
            $table->enum('estado_final', ['OPERATIVO', 'REQUIERE_REPARACION', 'DADO_DE_BAJA'])->default('OPERATIVO');
            $table->text('observaciones')->nullable();
            $table->foreignId('registrado_por')->constrained('usuarios');
            $table->timestamps();

            $table->index(['item_inventario_id', 'fecha_mantenimiento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mantenimientos');
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('inventario_institucional');
    }
};
