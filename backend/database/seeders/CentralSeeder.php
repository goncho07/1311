<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant\Tenant;
use App\Models\Tenant\Subscription;
use App\Models\Tenant\TenantUser;
use App\Services\Tenancy\TenantDatabaseManager;

class CentralSeeder extends Seeder
{
    public function run(): void
    {
        // Crear tenant demo
        $tenant = Tenant::create([
            'uuid' => \Str::uuid(),
            'tenant_code' => 'demo-ricardo-palma',
            'nombre_institucion' => 'IEE 6049 Ricardo Palma',
            'codigo_modular' => '6049',
            'ruc' => '20123456789',
            'tipo_gestion' => 'PUBLICO',
            'nivel_educativo' => 'SECUNDARIA',
            'ugel' => 'UGEL 07',
            'distrito' => 'Surquillo',
            'provincia' => 'Lima',
            'departamento' => 'Lima',
            'plan_suscripcion' => 'PREMIUM',
            'estado' => 'ACTIVO',
            'max_estudiantes' => 500,
            'max_docentes' => 50,
            'fecha_inicio_suscripcion' => now(),
            'fecha_fin_suscripcion' => now()->addYear(),
            'modulos_activos' => ['USUARIOS', 'MATRICULA', 'ACADEMICO', 'ASISTENCIA', 'COMUNICACIONES', 'RECURSOS', 'REPORTES', 'FINANZAS']
        ]);

        // Crear BD del tenant
        $tenantDBManager = app(TenantDatabaseManager::class);
        $tenantDBManager->createTenantDatabase($tenant);

        // Crear suscripción
        Subscription::create([
            'tenant_id' => $tenant->id,
            'plan' => 'PREMIUM',
            'precio_mensual' => 299.00,
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addYear(),
            'estado' => 'ACTIVA',
            'limites' => [
                'max_estudiantes' => 500,
                'max_docentes' => 50,
                'max_storage_gb' => 50
            ],
            'uso_actual' => [
                'estudiantes' => 0,
                'docentes' => 0,
                'storage_gb' => 0
            ]
        ]);

        // Crear usuario superadmin
        TenantUser::create([
            'tenant_id' => $tenant->id,
            'email' => 'director@ricardopalma.edu.pe',
            'nombres' => 'María',
            'apellidos' => 'González Pérez',
            'rol' => 'DIRECTOR',
            'activo' => true
        ]);

        $this->command->info('✅ Tenant demo creado: ' . $tenant->tenant_code);
        $this->command->info('✅ Base de datos creada: ' . $tenant->database_name);
    }
}
