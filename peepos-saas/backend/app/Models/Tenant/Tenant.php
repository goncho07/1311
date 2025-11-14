<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;

/**
 * Modelo Tenant que extiende Stancl/Tenancy
 *
 * 🔴 CRÍTICO: Este modelo vive en la BD Central
 * Cada tenant tiene su propia BD separada (database-per-tenant)
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory, SoftDeletes, HasDatabase;

    // Nombre de la tabla en BD Central
    protected $table = 'tenants';

    // Primary key personalizada para Stancl/Tenancy
    // Usa UUID como identificador único del tenant
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    // Campos rellenables
    protected $fillable = [
        'uuid',
        'tenant_code',
        'nombre_institucion',
        'codigo_modular',
        'ruc',
        'database_name',
        'database_host',
        'direccion',
        'distrito',
        'provincia',
        'departamento',
        'ugel',
        'tipo_gestion',
        'nivel_educativo',
        'plan_suscripcion',
        'estado',
        'max_estudiantes',
        'max_docentes',
        'max_storage_gb',
        'fecha_inicio_suscripcion',
        'fecha_fin_suscripcion',
        'configuracion',
        'modulos_activos',
        'logo_url',
        'dominio_personalizado',
    ];

    // Casteos de atributos
    protected $casts = [
        'configuracion' => 'array',
        'modulos_activos' => 'array',
        'fecha_inicio_suscripcion' => 'date',
        'fecha_fin_suscripcion' => 'date',
        'max_estudiantes' => 'integer',
        'max_docentes' => 'integer',
        'max_storage_gb' => 'integer',
    ];

    /**
     * Relación con suscripción
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Relación con usuarios
     */
    public function users()
    {
        return $this->hasMany(\App\Models\User::class);
    }

    /**
     * Verificar si el tenant está activo
     */
    public function isActive(): bool
    {
        return $this->estado === 'ACTIVO';
    }

    /**
     * Verificar si tiene suscripción válida
     */
    public function hasValidSubscription(): bool
    {
        return $this->subscription
            && $this->subscription->estado === 'ACTIVA'
            && $this->subscription->fecha_fin->isFuture();
    }

    /**
     * Nombre de la base de datos del tenant
     * Usada por Stancl/Tenancy para crear/conectar BD
     */
    public function getCustomDatabaseName(): string
    {
        // Usar el campo database_name si existe, sino construir con prefijo
        return $this->database_name ?? (config('tenancy.database.prefix') . $this->uuid);
    }

    /**
     * Método requerido por Stancl/Tenancy
     * Define el nombre del campo que contiene el identificador del tenant
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'uuid',
            'tenant_code',
        ];
    }

    /**
     * Verificar si está en período de prueba
     */
    public function isTrial(): bool
    {
        return $this->estado === 'PRUEBA';
    }

    /**
     * Verificar si está suspendido
     */
    public function isSuspended(): bool
    {
        return $this->estado === 'SUSPENDIDO';
    }

    /**
     * Verificar si el plan permite cierto módulo
     */
    public function hasModule(string $module): bool
    {
        return in_array($module, $this->modulos_activos ?? []);
    }

    /**
     * Verificar si ha alcanzado límite de estudiantes
     */
    public function hasReachedStudentLimit(): bool
    {
        // Implementar lógica de conteo real en tenant DB
        return false;
    }

    /**
     * Verificar si ha alcanzado límite de docentes
     */
    public function hasReachedTeacherLimit(): bool
    {
        // Implementar lógica de conteo real en tenant DB
        return false;
    }
}
