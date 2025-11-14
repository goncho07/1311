<?php

namespace App\Services\Finanzas;

use App\Models\CuentaPorCobrar;
use App\Models\ConceptoPago;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CobranzaService
{
    /**
     * Generar cuenta por cobrar
     */
    public function generarCuentaPorCobrar(array $data): CuentaPorCobrar
    {
        try {
            $cuenta = CuentaPorCobrar::create([
                'uuid' => \Str::uuid(),
                'numero_cuenta' => $this->generarNumeroCuenta(),
                'concepto_pago_id' => $data['concepto_pago_id'],
                'apoderado_id' => $data['apoderado_id'],
                'estudiante_id' => $data['estudiante_id'],
                'periodo_academico_id' => $data['periodo_academico_id'],
                'monto_total' => $data['monto_total'],
                'monto_pagado' => 0,
                'monto_pendiente' => $data['monto_total'],
                'moneda' => 'PEN',
                'fecha_emision' => now(),
                'fecha_vencimiento' => $data['fecha_vencimiento'],
                'estado' => 'PENDIENTE'
            ]);

            Log::info("Cuenta por cobrar generada", ['cuenta_id' => $cuenta->id]);

            return $cuenta;

        } catch (\Exception $e) {
            Log::error("Error generando cuenta por cobrar: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generar número de cuenta único
     */
    protected function generarNumeroCuenta(): string
    {
        $year = now()->year;
        $sequence = CuentaPorCobrar::where('numero_cuenta', 'like', "CPC{$year}%")->count() + 1;

        return sprintf("CPC%s%06d", $year, $sequence);
    }

    /**
     * Generar cuentas masivas para un grado
     */
    public function generarCuentasMasivas(int $conceptoPagoId, string $grado, string $seccion, int $periodoId): array
    {
        $concepto = ConceptoPago::findOrFail($conceptoPagoId);
        $resultados = ['exitosas' => [], 'fallidas' => []];

        DB::beginTransaction();

        try {
            $estudiantes = \App\Models\Estudiante::whereHas('matriculas', function($q) use ($grado, $seccion, $periodoId) {
                $q->where('grado', $grado)
                  ->where('seccion', $seccion)
                  ->where('periodo_academico_id', $periodoId)
                  ->where('situacion', 'ACTIVA');
            })->get();

            foreach ($estudiantes as $estudiante) {
                try {
                    $apoderado = $estudiante->apoderados()->first();
                    if ($apoderado) {
                        $cuenta = $this->generarCuentaPorCobrar([
                            'concepto_pago_id' => $conceptoPagoId,
                            'apoderado_id' => $apoderado->id,
                            'estudiante_id' => $estudiante->id,
                            'periodo_academico_id' => $periodoId,
                            'monto_total' => $concepto->monto,
                            'fecha_vencimiento' => now()->addDays(30)
                        ]);

                        $resultados['exitosas'][] = $cuenta;
                    }
                } catch (\Exception $e) {
                    $resultados['fallidas'][] = [
                        'estudiante_id' => $estudiante->id,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return $resultados;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error generando cuentas masivas: " . $e->getMessage());
            throw $e;
        }
    }
}
