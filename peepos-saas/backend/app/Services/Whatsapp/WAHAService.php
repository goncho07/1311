<?php

namespace App\Services\Whatsapp;

use App\Models\WhatsAppBotConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * ═══════════════════════════════════════════════════════════════
 * WAHA Service - Integración con WAHA API (WhatsApp HTTP API)
 * ═══════════════════════════════════════════════════════════════
 *
 * Documentación WAHA: https://waha.devlike.pro
 *
 * Arquitectura:
 * - 1 contenedor WAHA soporta 500 sesiones simultáneas
 * - Cada colegio (tenant) tiene 3 bots: inicial, primaria, secundaria
 * - Cada bot = 1 sesión WAHA con nombre único: "tenantX-nivel"
 */
class WAHAService
{
    protected string $apiUrl;
    protected int $timeout = 30;

    public function __construct()
    {
        $this->apiUrl = config('services.waha.api_url', 'http://waha:3000');
    }

    /**
     * 📤 Enviar mensaje de texto simple
     *
     * @param string $sessionName Nombre de sesión (ej: "colegio5-primaria")
     * @param string $chatId Número de teléfono con código país (ej: "51987654321@c.us")
     * @param string $texto Contenido del mensaje
     * @return array
     */
    public function enviarTexto(string $sessionName, string $chatId, string $texto): array
    {
        try {
            // Verificar que la sesión existe y está activa
            $bot = WhatsAppBotConfig::where('session_name', $sessionName)
                ->where('estado', 'ACTIVO')
                ->firstOrFail();

            // Formatear chatId si no tiene formato correcto
            if (!str_contains($chatId, '@')) {
                $chatId = $this->formatearChatId($chatId);
            }

            // Llamada a WAHA API
            $response = Http::timeout($this->timeout)
                ->post("{$this->apiUrl}/api/sendText", [
                    'session' => $sessionName,
                    'chatId' => $chatId,
                    'text' => $texto,
                ]);

            if ($response->successful()) {
                // Actualizar estadísticas
                $bot->incrementarMensajesEnviados();

                Log::info('Mensaje WhatsApp enviado vía WAHA', [
                    'session' => $sessionName,
                    'chatId' => $chatId,
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('Error al enviar mensaje WhatsApp vía WAHA', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Error al enviar mensaje: ' . $response->body(),
            ];

        } catch (Exception $e) {
            Log::error('Excepción al enviar mensaje WhatsApp vía WAHA: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * 🔘 Enviar mensaje con botones interactivos
     *
     * @param string $sessionName
     * @param string $chatId
     * @param string $texto
     * @param array $botones Array de botones: [['id' => '1', 'text' => 'Ver Notas'], ...]
     * @return array
     */
    public function enviarBotones(string $sessionName, string $chatId, string $texto, array $botones): array
    {
        try {
            $bot = WhatsAppBotConfig::where('session_name', $sessionName)
                ->where('estado', 'ACTIVO')
                ->firstOrFail();

            if (!str_contains($chatId, '@')) {
                $chatId = $this->formatearChatId($chatId);
            }

            // Llamada a WAHA API
            $response = Http::timeout($this->timeout)
                ->post("{$this->apiUrl}/api/sendButtons", [
                    'session' => $sessionName,
                    'chatId' => $chatId,
                    'text' => $texto,
                    'buttons' => $botones,
                ]);

            if ($response->successful()) {
                $bot->incrementarMensajesEnviados();

                Log::info('Mensaje con botones enviado vía WAHA', [
                    'session' => $sessionName,
                    'chatId' => $chatId,
                    'botones_count' => count($botones),
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Error al enviar mensaje con botones: ' . $response->body(),
            ];

        } catch (Exception $e) {
            Log::error('Excepción al enviar botones WhatsApp: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * 🖼️ Enviar imagen con caption
     *
     * @param string $sessionName
     * @param string $chatId
     * @param string $imageUrl URL de la imagen
     * @param string|null $caption Texto que acompaña la imagen
     * @return array
     */
    public function enviarImagen(string $sessionName, string $chatId, string $imageUrl, ?string $caption = null): array
    {
        try {
            $bot = WhatsAppBotConfig::where('session_name', $sessionName)
                ->where('estado', 'ACTIVO')
                ->firstOrFail();

            if (!str_contains($chatId, '@')) {
                $chatId = $this->formatearChatId($chatId);
            }

            $payload = [
                'session' => $sessionName,
                'chatId' => $chatId,
                'file' => [
                    'url' => $imageUrl,
                ],
            ];

            if ($caption) {
                $payload['file']['caption'] = $caption;
            }

            $response = Http::timeout($this->timeout)
                ->post("{$this->apiUrl}/api/sendImage", $payload);

            if ($response->successful()) {
                $bot->incrementarMensajesEnviados();

                Log::info('Imagen enviada vía WAHA', [
                    'session' => $sessionName,
                    'chatId' => $chatId,
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Error al enviar imagen: ' . $response->body(),
            ];

        } catch (Exception $e) {
            Log::error('Excepción al enviar imagen WhatsApp: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * ✅ Verificar estado de conexión de una sesión
     *
     * @param string $sessionName
     * @return array
     */
    public function verificarSesion(string $sessionName): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get("{$this->apiUrl}/api/sessions/{$sessionName}");

            if ($response->successful()) {
                $data = $response->json();

                // Actualizar estado del bot en BD
                $bot = WhatsAppBotConfig::where('session_name', $sessionName)->first();
                if ($bot) {
                    $estado = $data['status'] === 'WORKING' ? 'ACTIVO' : 'DESCONECTADO';
                    $bot->update([
                        'estado' => $estado,
                        'ultima_conexion' => $estado === 'ACTIVO' ? now() : $bot->ultima_conexion,
                    ]);
                }

                return [
                    'success' => true,
                    'conectado' => $data['status'] === 'WORKING',
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'conectado' => false,
                'error' => 'Sesión no encontrada',
            ];

        } catch (Exception $e) {
            Log::error('Error al verificar sesión WAHA: ' . $e->getMessage());

            return [
                'success' => false,
                'conectado' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * 📱 Obtener código QR para conectar sesión
     *
     * @param string $sessionName
     * @return array
     */
    public function obtenerQR(string $sessionName): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get("{$this->apiUrl}/api/{$sessionName}/auth/qr");

            if ($response->successful()) {
                $data = $response->json();

                // Actualizar QR en BD
                $bot = WhatsAppBotConfig::where('session_name', $sessionName)->first();
                if ($bot && isset($data['qr'])) {
                    $bot->update([
                        'qr_code_path' => $data['qr'], // WAHA devuelve base64
                        'qr_generado_at' => now(),
                    ]);
                }

                return [
                    'success' => true,
                    'qr' => $data['qr'] ?? null,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => 'No se pudo obtener QR',
            ];

        } catch (Exception $e) {
            Log::error('Error al obtener QR WAHA: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * 🔄 Notificación de asistencia automática
     *
     * @param string $nivelEducativo inicial, primaria, secundaria
     * @param array $apoderados Array de apoderados con teléfonos
     * @param array $datosEstudiante Info del estudiante y asistencia
     * @return array
     */
    public function notificarAsistencia(string $nivelEducativo, array $apoderados, array $datosEstudiante): array
    {
        $resultados = [
            'enviados' => 0,
            'fallidos' => 0,
            'errores' => [],
        ];

        try {
            // Obtener bot del nivel educativo
            $bot = WhatsAppBotConfig::where('nivel_educativo', $nivelEducativo)
                ->where('estado', 'ACTIVO')
                ->first();

            if (!$bot) {
                throw new Exception("No hay bot activo para nivel: {$nivelEducativo}");
            }

            // Construir mensaje
            $estadoIcono = $datosEstudiante['estado'] === 'PRESENTE' ? '🟢' : '🔴';
            $mensaje = "{$estadoIcono} *Notificación de Asistencia*\n\n";
            $mensaje .= "Estudiante: *{$datosEstudiante['nombre_estudiante']}*\n";
            $mensaje .= "Fecha: {$datosEstudiante['fecha']}\n";
            $mensaje .= "Hora: {$datosEstudiante['hora']}\n";
            $mensaje .= "Estado: *{$datosEstudiante['estado']}*\n\n";
            $mensaje .= "_Este es un mensaje automático del sistema PEEPOS._";

            // Enviar a cada apoderado
            foreach ($apoderados as $apoderado) {
                if (empty($apoderado['telefono'])) {
                    continue;
                }

                $resultado = $this->enviarTexto(
                    $bot->session_name,
                    $apoderado['telefono'],
                    $mensaje
                );

                if ($resultado['success']) {
                    $resultados['enviados']++;
                } else {
                    $resultados['fallidos']++;
                    $resultados['errores'][] = [
                        'apoderado' => $apoderado['nombre'],
                        'error' => $resultado['error'],
                    ];
                }

                // Pequeña pausa entre mensajes para evitar rate limiting
                usleep(500000); // 0.5 segundos
            }

            Log::info('Notificaciones de asistencia enviadas', [
                'nivel' => $nivelEducativo,
                'estudiante' => $datosEstudiante['nombre_estudiante'],
                'enviados' => $resultados['enviados'],
                'fallidos' => $resultados['fallidos'],
            ]);

        } catch (Exception $e) {
            Log::error('Error en notificación de asistencia: ' . $e->getMessage());
            $resultados['errores'][] = $e->getMessage();
        }

        return $resultados;
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS AUXILIARES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Formatear número de teléfono a formato WhatsApp
     * Ejemplo: "987654321" -> "51987654321@c.us" (Perú)
     */
    private function formatearChatId(string $telefono): string
    {
        // Limpiar el número
        $telefono = preg_replace('/[^0-9]/', '', $telefono);

        // Si no tiene código de país, agregar código de Perú (+51)
        if (strlen($telefono) === 9) {
            $telefono = '51' . $telefono;
        }

        return $telefono . '@c.us';
    }
}
