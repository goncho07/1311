<?php

namespace App\Services\Finanzas;

use App\Models\TransaccionFinanciera;
use App\Models\CuentaPorCobrar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PagoService
{
    /**
     * Procesar pago
     */
    public function procesarPago(array $data): TransaccionFinanciera
    {
        DB::beginTransaction();

        try {
            $transaccion = TransaccionFinanciera::create([
                'uuid' => \Str::uuid(),
                'numero_transaccion' => $this->generarNumeroTransaccion(),
                'concepto_pago_id' => $data['concepto_pago_id'],
                'apoderado_id' => $data['apoderado_id'],
                'estudiante_id' => $data['estudiante_id'],
                'tipo_transaccion' => 'INGRESO',
                'monto' => $data['monto'],
                'moneda' => 'PEN',
                'metodo_pago' => $data['metodo_pago'],
                'fecha_transaccion' => now(),
                'estado' => 'PAGADA',
                'numero_comprobante' => $data['numero_comprobante'] ?? null,
                'procesado_por' => auth()->id()
            ]);

            // Actualizar cuenta por cobrar si existe
            if (isset($data['cuenta_por_cobrar_id'])) {
                $cuenta = CuentaPorCobrar::findOrFail($data['cuenta_por_cobrar_id']);
                $cuenta->registrarPago($data['monto']);
            }

            DB::commit();

            Log::info("Pago procesado", ['transaccion_id' => $transaccion->id]);

            return $transaccion;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error procesando pago: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generar número de transacción único
     */
    protected function generarNumeroTransaccion(): string
    {
        $year = now()->year;
        $sequence = TransaccionFinanciera::where('numero_transaccion', 'like', "TRX{$year}%")->count() + 1;

        return sprintf("TRX%s%08d", $year, $sequence);
    }
}
