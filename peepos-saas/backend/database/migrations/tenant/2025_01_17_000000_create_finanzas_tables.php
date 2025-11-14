<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Módulo de finanzas y pagos
     */
    public function up(): void
    {
        // Tabla: conceptos_pago
        Schema::create('conceptos_pago', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_concepto', 20)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['MATRICULA', 'PENSION', 'TALLER', 'UNIFORME', 'MATERIALES', 'EVENTO', 'MULTA', 'OTRO']);
            $table->enum('frecuencia', ['UNICA', 'MENSUAL', 'BIMESTRAL', 'ANUAL'])->default('UNICA');
            $table->decimal('monto_base', 10, 2);
            $table->boolean('monto_variable')->default(false);
            $table->enum('aplicable_grado', ['TODOS', '1°', '2°', '3°', '4°', '5°'])->default('TODOS');
            $table->boolean('obligatorio')->default(true);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['codigo_concepto']);
            $table->index(['tipo']);
        });

        // Tabla: cuentas_por_cobrar
        Schema::create('cuentas_por_cobrar', function (Blueprint $table) {
            $table->id();
            $table->string('numero_documento', 30)->unique();
            $table->foreignId('estudiante_id')->constrained('estudiantes');
            $table->foreignId('concepto_pago_id')->constrained('conceptos_pago');
            $table->foreignId('periodo_academico_id')->constrained('periodos_academicos');
            $table->integer('mes')->nullable()->comment('1-12 para pensiones');
            $table->decimal('monto_original', 10, 2);
            $table->decimal('descuento', 10, 2')->default(0.00);
            $table->decimal('recargo', 10, 2)->default(0.00);
            $table->decimal('monto_total', 10, 2);
            $table->decimal('monto_pagado', 10, 2)->default(0.00);
            $table->decimal('saldo_pendiente', 10, 2);
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['PENDIENTE', 'PAGADO_PARCIAL', 'PAGADO', 'VENCIDO', 'ANULADO'])->default('PENDIENTE');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['estudiante_id', 'estado']);
            $table->index(['periodo_academico_id', 'mes']);
            $table->index(['fecha_vencimiento', 'estado']);
        });

        // Tabla: transacciones_financieras
        Schema::create('transacciones_financieras', function (Blueprint $table) {
            $table->id();
            $table->string('numero_comprobante', 30)->unique();
            $table->foreignId('cuenta_por_cobrar_id')->constrained('cuentas_por_cobrar');
            $table->foreignId('estudiante_id')->constrained('estudiantes');
            $table->date('fecha_pago');
            $table->time('hora_pago')->useCurrent();
            $table->enum('tipo_comprobante', ['BOLETA', 'FACTURA', 'RECIBO', 'NOTA_CREDITO']);
            $table->decimal('monto_pagado', 10, 2);
            $table->enum('metodo_pago', ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'YAPE', 'PLIN', 'DEPOSITO']);
            $table->string('numero_operacion', 100)->nullable();
            $table->string('banco', 100)->nullable();
            $table->text('comprobante_imagen')->nullable();
            $table->foreignId('recibido_por')->constrained('usuarios');
            $table->boolean('anulado')->default(false);
            $table->text('motivo_anulacion')->nullable();
            $table->foreignId('anulado_por')->nullable()->constrained('usuarios');
            $table->timestamp('fecha_anulacion')->nullable();
            $table->timestamps();

            $table->index(['cuenta_por_cobrar_id']);
            $table->index(['estudiante_id', 'fecha_pago']);
            $table->index(['numero_comprobante']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transacciones_financieras');
        Schema::dropIfExists('cuentas_por_cobrar');
        Schema::dropIfExists('conceptos_pago');
    }
};
