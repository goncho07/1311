<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * Generar contenido con Gemini Pro
     */
    public function generateContent(string $prompt, array $options = []): array
    {
        $model = $options['model'] ?? 'gemini-pro';

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("{$this->apiUrl}{$model}:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => $options['temperature'] ?? 0.7,
                'topK' => $options['topK'] ?? 40,
                'topP' => $options['topP'] ?? 0.95,
                'maxOutputTokens' => $options['maxTokens'] ?? 2048,
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Gemini API error: " . $response->body());
        }

        return $response->json();
    }

    /**
     * Analizar documento con vision
     */
    public function analyzeDocument(string $base64Image, string $prompt): array
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("{$this->apiUrl}gemini-pro-vision:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => 'image/jpeg',
                                'data' => $base64Image
                            ]
                        ]
                    ]
                ]
            ],
        ]);

        if ($response->failed()) {
            throw new \Exception("Gemini Vision API error: " . $response->body());
        }

        return $response->json();
    }

    /**
     * Extraer datos de documento educativo
     */
    public function extractEducationalData(string $base64Image, string $documentType): array
    {
        $prompts = [
            'lista_estudiantes' => 'Extrae los datos de esta lista de estudiantes en formato JSON. Incluye: nombre completo, DNI, grado, sección, fecha de nacimiento.',
            'notas' => 'Extrae las notas de esta boleta o registro. Incluye: estudiante, curso/competencia, periodo, calificación, observaciones.',
            'asistencia' => 'Extrae los datos de asistencia. Incluye: fecha, estudiante, estado (presente/ausente/tardanza), observaciones.',
            'matricula' => 'Extrae datos de matrícula. Incluye: datos del estudiante, apoderado, dirección, teléfonos, emergencias.',
        ];

        $prompt = $prompts[$documentType] ?? 'Extrae todos los datos relevantes de este documento educativo en formato JSON estructurado.';

        $result = $this->analyzeDocument($base64Image, $prompt);

        return $this->parseJsonFromResponse($result);
    }

    /**
     * Parsear JSON de la respuesta de Gemini
     */
    protected function parseJsonFromResponse(array $response): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Extraer JSON del texto
        preg_match('/\{.*\}/s', $text, $matches);

        if (empty($matches)) {
            return ['raw_text' => $text];
        }

        try {
            return json_decode($matches[0], true);
        } catch (\Exception $e) {
            return ['raw_text' => $text, 'error' => 'Failed to parse JSON'];
        }
    }

    /**
     * Generar resumen de rendimiento académico
     */
    public function generateAcademicSummary(array $studentData): string
    {
        $prompt = "Genera un resumen académico conciso para:\n\n" . json_encode($studentData, JSON_PRETTY_PRINT);

        $result = $this->generateContent($prompt);

        return $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    /**
     * Sugerir estrategias pedagógicas
     */
    public function suggestPedagogicalStrategies(array $performanceData): array
    {
        $prompt = "Como experto en pedagogía, sugiere estrategias para mejorar el rendimiento académico basándote en estos datos:\n\n"
            . json_encode($performanceData, JSON_PRETTY_PRINT)
            . "\n\nProporciona 3-5 estrategias concretas y accionables.";

        $result = $this->generateContent($prompt);

        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Parsear estrategias
        return $this->parseStrategies($text);
    }

    /**
     * Parsear estrategias del texto
     */
    protected function parseStrategies(string $text): array
    {
        // Separar por líneas numeradas o con bullets
        $lines = explode("\n", $text);
        $strategies = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (preg_match('/^[\d\-\*•]\s*(.+)/', $line, $matches)) {
                $strategies[] = trim($matches[1]);
            }
        }

        return $strategies;
    }
}
