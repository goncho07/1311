<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla de configuración institucional
     */
    public function up(): void
    {
        Schema::create('configuracion_institucional', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 100)->unique();
            $table->string('categoria', 50)->comment('GENERAL, ACADEMICO, ASISTENCIA, COMUNICACION, etc');
            $table->text('valor')->nullable();
            $table->enum('tipo_dato', ['STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'DATE', 'TIME'])->default('STRING');
            $table->text('descripcion')->nullable();
            $table->boolean('es_publica')->default(false)->comment('Si se expone al frontend');
            $table->boolean('requiere_reinicio')->default(false);
            $table->foreignId('modificado_por')->nullable()->constrained('usuarios');
            $table->timestamp('ultima_modificacion')->nullable();
            $table->timestamps();

            $table->index(['clave']);
            $table->index(['categoria']);
        });

        // Insertar configuraciones por defecto
        DB::table('configuracion_institucional')->insert([
            [
                'clave' => 'año_academico_actual',
                'categoria' => 'ACADEMICO',
                'valor' => date('Y'),
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Año académico en curso',
                'es_publica' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'numero_bimestres',
                'categoria' => 'ACADEMICO',
                'valor' => '4',
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Cantidad de bimestres por año',
                'es_publica' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'tolerancia_tardanza_minutos',
                'categoria' => 'ASISTENCIA',
                'valor' => '15',
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Minutos de tolerancia para marcar tardanza',
                'es_publica' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'qr_expiracion_minutos',
                'categoria' => 'ASISTENCIA',
                'valor' => '30',
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Tiempo de validez de códigos QR para asistencia',
                'es_publica' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'whatsapp_habilitado',
                'categoria' => 'COMUNICACION',
                'valor' => 'true',
                'tipo_dato' => 'BOOLEAN',
                'descripcion' => 'Habilitar envío de mensajes por WhatsApp',
                'es_publica' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'limite_dias_justificacion',
                'categoria' => 'ASISTENCIA',
                'valor' => '3',
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Días máximos para justificar inasistencia',
                'es_publica' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'nota_minima_aprobatoria',
                'categoria' => 'ACADEMICO',
                'valor' => '11',
                'tipo_dato' => 'INTEGER',
                'descripcion' => 'Nota mínima para aprobar (escala vigesimal)',
                'es_publica' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracion_institucional');
    }
};
