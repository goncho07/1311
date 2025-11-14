<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de suscripciones en BD Central
     * Gestiona planes y pagos de cada institución
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->enum('plan', ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']);
            $table->decimal('precio_mensual', 10, 2);
            $table->decimal('descuento_porcentaje', 5, 2)->default(0);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('auto_renovar')->default(true);
            $table->enum('estado', ['ACTIVA', 'VENCIDA', 'CANCELADA', 'SUSPENDIDA'])->default('ACTIVA');
            $table->enum('metodo_pago', ['TRANSFERENCIA', 'TARJETA', 'EFECTIVO', 'YAPE', 'PLIN'])->nullable();
            $table->string('numero_operacion', 100)->nullable();
            $table->json('limites')->comment('Límites del plan');
            $table->json('uso_actual')->comment('Uso actual recursos');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'estado']);
            $table->index(['fecha_fin']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
