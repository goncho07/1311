<?php

namespace App\Services\Import;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DocumentClassifier
{
    protected string $apiKey;
    protected string $model = 'gemini-1.5-flash';
    
    protected array $modulos = [
        'USUARIOS' => [
            'keywords' => ['estudiantes', 'docentes', 'apoderados', 'usuarios', 'personal', 'matricula', 'dni', 'nombres', 'apellidos'],
            'description' => 'Archivos de usuarios del sistema (estudiantes, docentes, apoderados)',
        ],
        'ACADEMICO' => [
            'keywords' => ['notas', 'calificaciones', 'evaluaciones', 'competencias', 'areas', 'bimestre', 'trimestre', 'grado', 'seccion'],
            'description' => 'Archivos académicos (calificaciones, evaluaciones, competencias)',
        ],
        'ASISTENCIA' => [
            'keywords' => ['asistencia', 'faltas', 'tardanzas', 'fecha', 'presente', 'ausente'],
            'description' => 'Archivos de asistencia de estudiantes',
        ],
        'FINANZAS' => [
            'keywords' => ['pagos', 'pensiones', 'cobros', 'cuotas', 'monto', 'deuda', 'factura', 'recibo'],
            'description' => 'Archivos financieros (pagos, pensiones, cobros)',
        ],
        'RECURSOS' => [
            'keywords' => ['inventario', 'materiales', 'equipos', 'recursos', 'stock', 'cantidad'],
            'description' => 'Archivos de inventario y recursos educativos',
        ],
        'COMUNICACIONES' => [
            'keywords' => ['comunicados', 'mensajes', 'notificaciones', 'anuncios'],
            'description' => 'Archivos de comunicaciones',
        ],
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    public function clasificar(string $nombreArchivo, ?string $contenidoPreview = null): array
    {
        $clasificacionBasica = $this->clasificacionPorKeywords($nombreArchivo);
        
        if ($clasificacionBasica['confianza'] >= 0.90) {
            return $clasificacionBasica;
        }

        if ($contenidoPreview && config('services.gemini.enabled', true)) {
            try {
                return $this->clasificacionConIA($nombreArchivo, $contenidoPreview);
            } catch (\Exception $e) {
                Log::warning('Error en clasificación IA, usando clasificación básica', [
                    'archivo' => $nombreArchivo,
                    'error' => $e->getMessage(),
                ]);
                return $clasificacionBasica;
            }
        }

        return $clasificacionBasica;
    }

    protected function clasificacionPorKeywords(string $nombreArchivo): array
    {
        $nombreLower = strtolower($nombreArchivo);
        $scores = [];

        foreach ($this->modulos as $modulo => $config) {
            $score = 0;
            foreach ($config['keywords'] as $keyword) {
                if (str_contains($nombreLower, strtolower($keyword))) {
                    $score += 1;
                }
            }
            $scores[$modulo] = $score;
        }

        $maxScore = max($scores);
        
        if ($maxScore === 0) {
            return [
                'modulo' => 'DESCONOCIDO',
                'confianza' => 0.0,
                'metodo' => 'keywords',
            ];
        }

        $moduloDetectado = array_search($maxScore, $scores);
        $totalKeywords = count($this->modulos[$moduloDetectado]['keywords']);
        $confianza = min($maxScore / $totalKeywords, 1.0);

        return [
            'modulo' => $moduloDetectado,
            'confianza' => round($confianza, 2),
            'metodo' => 'keywords',
        ];
    }

    protected function clasificacionConIA(string $nombreArchivo, string $contenidoPreview): array
    {
        $modulosDisponibles = array_keys($this->modulos);
        $descripcionModulos = array_map(
            fn($modulo) => "{$modulo}: {$this->modulos[$modulo]['description']}",
            $modulosDisponibles
        );

        $prompt = "Analiza el siguiente archivo educativo y clasifícalo en uno de estos módulos:\n\n" .
                  implode("\n", $descripcionModulos) .
                  "\n\nNombre del archivo: {$nombreArchivo}\n" .
                  "\nContenido (primeras líneas):\n{$contenidoPreview}\n\n" .
                  "Responde SOLO con el nombre del módulo (por ejemplo: USUARIOS, ACADEMICO, etc.). " .
                  "Si no estás seguro, responde DESCONOCIDO.";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'maxOutputTokens' => 50,
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Error en API de Gemini: ' . $response->body());
        }

        $data = $response->json();
        $textoRespuesta = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $moduloDetectado = trim(strtoupper($textoRespuesta));

        if (!in_array($moduloDetectado, $modulosDisponibles)) {
            $moduloDetectado = 'DESCONOCIDO';
        }

        return [
            'modulo' => $moduloDetectado,
            'confianza' => $moduloDetectado === 'DESCONOCIDO' ? 0.5 : 0.95,
            'metodo' => 'gemini_ai',
            'respuesta_ia' => $textoRespuesta,
        ];
    }

    public function obtenerModulosDisponibles(): array
    {
        return array_keys($this->modulos);
    }
}
