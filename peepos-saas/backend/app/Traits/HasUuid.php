<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    /**
     * Boot del trait
     */
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Indicar que el modelo usa UUID
     */
    public function getIncrementing(): bool
    {
        return false;
    }

    /**
     * Tipo de la clave primaria
     */
    public function getKeyType(): string
    {
        return 'string';
    }
}
