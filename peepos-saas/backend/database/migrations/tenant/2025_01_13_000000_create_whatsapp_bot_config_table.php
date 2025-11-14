<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('whatsapp_bot_config', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Información del bot
            $table->string('nivel_educativo'); // inicial, primaria, secundaria
            $table->string('session_name')->unique(); // ej: "colegio5-primaria"
            $table->string('numero_whatsapp', 20); // Número del bot
            $table->string('nombre_bot', 100); // Nombre descriptivo

            // Estado del bot
            $table->enum('estado', ['ACTIVO', 'INACTIVO', 'DESCONECTADO', 'ERROR'])->default('INACTIVO');
            $table->timestamp('ultima_conexion')->nullable();
            $table->string('qr_code_path')->nullable(); // Path del QR para conectar
            $table->timestamp('qr_generado_at')->nullable();

            // Configuración
            $table->json('configuracion')->nullable(); // Horarios, mensajes automáticos, etc.
            $table->json('estadisticas')->nullable(); // Mensajes enviados, entregas, etc.

            // Metadata
            $table->text('notas')->nullable();
            $table->boolean('activo')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indices
            $table->index('nivel_educativo');
            $table->index('session_name');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_bot_config');
    }
};
