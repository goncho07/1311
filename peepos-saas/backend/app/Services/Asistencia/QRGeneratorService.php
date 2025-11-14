<?php

namespace App\Services\Asistencia;

use App\Models\CodigoQrAsistencia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QRGeneratorService
{
    /**
     * Genera código QR para asistencia de un grado y sección
     */
    public function generarQRParaSeccion(string $grado, string $seccion, int $duracionMinutos = 5): array
    {
        $codigo = Str::random(32);
        $fechaExpiracion = now()->addMinutes($duracionMinutos);

        $qrRecord = CodigoQrAsistencia::create([
            'uuid' => Str::uuid(),
            'codigo' => $codigo,
            'grado' => $grado,
            'seccion' => $seccion,
            'tipo' => 'SECCION',
            'fecha_generacion' => now(),
            'fecha_expiracion' => $fechaExpiracion,
            'valido' => true,
            'veces_usado' => 0,
            'max_usos' => null,
            'generado_por' => auth()->id()
        ]);

        // Generar imagen QR
        $qrImage = QrCode::format('png')
                         ->size(300)
                         ->errorCorrection('H')
                         ->generate($codigo);

        $filename = "qr_{$grado}_{$seccion}_" . now()->timestamp . ".png";
        $path = "qr_codes/{$filename}";

        Storage::disk('public')->put($path, $qrImage);

        return [
            'codigo' => $codigo,
            'qr_record_id' => $qrRecord->id,
            'url_imagen' => Storage::url($path),
            'fecha_expiracion' => $fechaExpiracion,
            'duracion_minutos' => $duracionMinutos
        ];
    }

    /**
     * Valida código QR y registra uso
     */
    public function validarCodigo(string $codigo): bool
    {
        $qrRecord = CodigoQrAsistencia::where('codigo', $codigo)->first();

        if (!$qrRecord) {
            return false;
        }

        if (!$qrRecord->estaVigente()) {
            return false;
        }

        $qrRecord->incrementarUso();

        return true;
    }
}
