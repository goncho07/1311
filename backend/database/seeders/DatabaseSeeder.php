<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info('  Sistema Peepos - Inicialización de Base de Datos');
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->newLine();

        // Preguntar qué tipo de seeder ejecutar
        $type = $this->command->choice(
            '¿Qué base de datos desea inicializar?',
            [
                'central' => 'Base de datos CENTRAL (tenants y configuración global)',
                'tenant' => 'Base de datos TENANT (datos de institución específica)',
                'both' => 'AMBAS (central + tenant demo)',
            ],
            'both'
        );

        $this->command->newLine();

        if ($type === 'central' || $type === 'both') {
            $this->command->info('🚀 Iniciando seeder de Base de Datos CENTRAL...');
            $this->command->newLine();
            $this->call(CentralSeeder::class);
            $this->command->newLine();
        }

        if ($type === 'tenant' || $type === 'both') {
            $this->command->info('🚀 Iniciando seeder de Base de Datos TENANT...');
            $this->command->newLine();

            if ($type === 'tenant') {
                // Si solo es tenant, verificar que exista conexión tenant configurada
                $tenantCode = $this->command->ask('Ingrese el código del tenant', 'demo-ricardo-palma');

                // Configurar la conexión al tenant
                config(['database.connections.tenant.database' => 'peepos_tenant_' . str_replace('-', '_', $tenantCode)]);

                $this->command->info("Conectando a: " . config('database.connections.tenant.database'));
            }

            $this->call(TenantSeeder::class);
            $this->command->newLine();
        }

        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info('  ✅ Inicialización completada exitosamente');
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->newLine();

        // Mostrar credenciales de acceso
        if ($type === 'central' || $type === 'both') {
            $this->command->info('📧 Credenciales de acceso:');
            $this->command->info('   Email: director@ricardopalma.edu.pe');
            $this->command->info('   Tenant: demo-ricardo-palma');
            $this->command->newLine();
        }
    }
}
