<?php

namespace App\Services\Comunicaciones;

use App\Models\Comunicacion;
use App\Models\NotificacionSistema;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function __construct(
        protected WhatsAppService $whatsAppService
    ) {}

    /**
     * Notificar a apoderado
     */
    public function notificarApoderado(int $apoderadoId, string $asunto, string $mensaje, array $canales = ['SISTEMA']): void
    {
        try {
            $comunicacion = Comunicacion::create([
                'uuid' => \Str::uuid(),
                'apoderado_id' => $apoderadoId,
                'tipo' => 'NOTIFICACION',
                'asunto' => $asunto,
                'mensaje' => $mensaje,
                'prioridad' => 'NORMAL',
                'canal' => implode(',', $canales),
                'fecha_envio' => now(),
                'leido' => false,
                'enviado_por' => auth()->id()
            ]);

            // Enviar por WhatsApp si está en canales
            if (in_array('WHATSAPP', $canales)) {
                $apoderado = $comunicacion->apoderado;
                if ($apoderado->celular) {
                    $this->whatsAppService->enviarMensaje($apoderado->celular, $mensaje);
                }
            }

            Log::info("Notificación enviada", ['comunicacion_id' => $comunicacion->id]);

        } catch (\Exception $e) {
            Log::error("Error enviando notificación: " . $e->getMessage());
        }
    }

    /**
     * Crear notificación del sistema
     */
    public function crearNotificacion(int $usuarioId, string $tipo, string $titulo, string $mensaje, ?string $url = null): NotificacionSistema
    {
        return NotificacionSistema::create([
            'uuid' => \Str::uuid(),
            'usuario_id' => $usuarioId,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'url' => $url,
            'prioridad' => 'NORMAL',
            'leida' => false
        ]);
    }
}
