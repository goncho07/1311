<?php

namespace App\Services\Comunicaciones;

use App\Models\Comunicacion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url');
        $this->apiToken = config('services.whatsapp.api_token');
    }

    /**
     * Enviar mensaje de WhatsApp
     */
    public function enviarMensaje(string $telefono, string $mensaje): bool
    {
        try {
            $response = Http::withToken($this->apiToken)
                           ->post($this->apiUrl . '/messages', [
                               'to' => $this->formatearTelefono($telefono),
                               'body' => $mensaje
                           ]);

            if ($response->successful()) {
                Log::info("Mensaje WhatsApp enviado", ['telefono' => $telefono]);
                return true;
            }

            Log::error("Error enviando WhatsApp", ['response' => $response->body()]);
            return false;

        } catch (\Exception $e) {
            Log::error("Excepción enviando WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Enviar plantilla
     */
    public function enviarPlantilla(string $telefono, string $plantilla, array $parametros = []): bool
    {
        try {
            $response = Http::withToken($this->apiToken)
                           ->post($this->apiUrl . '/messages', [
                               'to' => $this->formatearTelefono($telefono),
                               'template' => [
                                   'name' => $plantilla,
                                   'language' => ['code' => 'es'],
                                   'components' => $this->formatearParametros($parametros)
                               ]
                           ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error("Error enviando plantilla WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Formatear teléfono al formato internacional
     */
    protected function formatearTelefono(string $telefono): string
    {
        // Eliminar caracteres no numéricos
        $telefono = preg_replace('/[^0-9]/', '', $telefono);

        // Agregar código de país si no tiene
        if (!str_starts_with($telefono, '51')) {
            $telefono = '51' . $telefono;
        }

        return $telefono;
    }

    /**
     * Formatear parámetros para plantilla
     */
    protected function formatearParametros(array $parametros): array
    {
        return array_map(fn($param) => ['type' => 'text', 'text' => $param], $parametros);
    }
}
