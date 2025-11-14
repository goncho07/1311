<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ═══════════════════════════════════════════════════════════
 * IMPORT RECORD MODEL
 * ═══════════════════════════════════════════════════════════
 * 
 * Representa un registro individual extraído de un archivo.
 * Contiene los datos mapeados y validados listos para importar.
 */
class ImportRecord extends Model
{
    use HasFactory;

    protected $table = 'import_records';

    protected $fillable = [
        'import_file_id',
        'fila_numero',
        'datos_originales',
        'datos_mapeados',
        'estado_validacion',
        'errores_validacion',
        'advertencias',
        'accion_sugerida',
        'registro_id_creado',
        'fecha_importacion',
    ];

    protected $casts = [
        'datos_originales' => 'array',
        'datos_mapeados' => 'array',
        'errores_validacion' => 'array',
        'advertencias' => 'array',
        'fila_numero' => 'integer',
        'registro_id_creado' => 'integer',
        'fecha_importacion' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ════════════════════════════════════════════════════════
    // RELACIONES
    // ════════════════════════════════════════════════════════

    /**
     * Archivo de importación al que pertenece este registro
     */
    public function file(): BelongsTo
    {
        return $this->belongsTo(ImportFile::class, 'import_file_id');
    }

    // ════════════════════════════════════════════════════════
    // ACCESSORS Y MUTATORS
    // ════════════════════════════════════════════════════════

    /**
     * Verificar si el registro es válido
     */
    public function getEsValidoAttribute(): bool
    {
        return $this->estado_validacion === 'VALIDO';
    }

    /**
     * Verificar si el registro tiene advertencias
     */
    public function getTieneAdvertenciasAttribute(): bool
    {
        return !empty($this->advertencias);
    }

    /**
     * Verificar si el registro ya fue importado
     */
    public function getFueImportadoAttribute(): bool
    {
        return $this->registro_id_creado !== null;
    }

    /**
     * Obtener número de errores
     */
    public function getNumeroErroresAttribute(): int
    {
        return count($this->errores_validacion ?? []);
    }

    /**
     * Obtener número de advertencias
     */
    public function getNumeroAdvertenciasAttribute(): int
    {
        return count($this->advertencias ?? []);
    }

    // ════════════════════════════════════════════════════════
    // SCOPES
    // ════════════════════════════════════════════════════════

    /**
     * Filtrar por estado de validación
     */
    public function scopeByEstadoValidacion($query, string $estado)
    {
        return $query->where('estado_validacion', $estado);
    }

    /**
     * Solo registros válidos
     */
    public function scopeValidos($query)
    {
        return $query->where('estado_validacion', 'VALIDO');
    }

    /**
     * Solo registros inválidos
     */
    public function scopeInvalidos($query)
    {
        return $query->where('estado_validacion', 'INVALIDO');
    }

    /**
     * Solo registros duplicados
     */
    public function scopeDuplicados($query)
    {
        return $query->where('estado_validacion', 'DUPLICADO');
    }

    /**
     * Solo registros ya importados
     */
    public function scopeImportados($query)
    {
        return $query->whereNotNull('registro_id_creado');
    }

    /**
     * Solo registros pendientes de importar
     */
    public function scopePendientes($query)
    {
        return $query->whereNull('registro_id_creado')
                     ->where('estado_validacion', 'VALIDO');
    }

    /**
     * Filtrar por acción sugerida
     */
    public function scopeByAccion($query, string $accion)
    {
        return $query->where('accion_sugerida', $accion);
    }

    // ════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ════════════════════════════════════════════════════════

    /**
     * Marcar como válido
     */
    public function marcarComoValido(string $accion = 'CREAR'): void
    {
        $this->update([
            'estado_validacion' => 'VALIDO',
            'accion_sugerida' => $accion,
            'errores_validacion' => [],
        ]);
    }

    /**
     * Marcar como inválido
     */
    public function marcarComoInvalido(array $errores): void
    {
        $this->update([
            'estado_validacion' => 'INVALIDO',
            'errores_validacion' => $errores,
            'accion_sugerida' => 'REVISAR',
        ]);
    }

    /**
     * Marcar como duplicado
     */
    public function marcarComoDuplicado(int $registroExistenteId): void
    {
        $this->update([
            'estado_validacion' => 'DUPLICADO',
            'accion_sugerida' => 'ACTUALIZAR',
            'advertencias' => [
                "Ya existe un registro similar (ID: {$registroExistenteId})",
            ],
        ]);
    }

    /**
     * Agregar advertencia
     */
    public function agregarAdvertencia(string $advertencia): void
    {
        $advertencias = $this->advertencias ?? [];
        $advertencias[] = $advertencia;
        
        $this->update([
            'advertencias' => $advertencias,
        ]);
    }

    /**
     * Marcar como importado
     */
    public function marcarComoImportado(int $registroId): void
    {
        $this->update([
            'registro_id_creado' => $registroId,
            'fecha_importacion' => now(),
        ]);
    }

    /**
     * Obtener valor mapeado por campo
     */
    public function getValorMapeado(string $campo): mixed
    {
        return $this->datos_mapeados[$campo] ?? null;
    }

    /**
     * Actualizar datos mapeados
     */
    public function actualizarDatosMapeados(array $nuevosDatos): void
    {
        $datosMapeados = array_merge($this->datos_mapeados ?? [], $nuevosDatos);
        
        $this->update([
            'datos_mapeados' => $datosMapeados,
        ]);
    }
}
