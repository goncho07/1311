<?php

namespace App\Services\Import;

use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class DataExtractor
{
    public function extraer(string $rutaArchivo, string $mimeType): array
    {
        $fullPath = Storage::path($rutaArchivo);

        if (!file_exists($fullPath)) {
            throw new \Exception("Archivo no encontrado: {$rutaArchivo}");
        }

        if ($this->esExcel($mimeType)) {
            return $this->extraerExcel($fullPath);
        }

        if ($this->esPdf($mimeType)) {
            return $this->extraerPdf($fullPath);
        }

        if ($this->esWord($mimeType)) {
            return $this->extraerWord($fullPath);
        }

        throw new \Exception("Tipo de archivo no soportado: {$mimeType}");
    }

    protected function esExcel(string $mimeType): bool
    {
        return in_array($mimeType, [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ]);
    }

    protected function esPdf(string $mimeType): bool
    {
        return $mimeType === 'application/pdf';
    }

    protected function esWord(string $mimeType): bool
    {
        return in_array($mimeType, [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ]);
    }

    protected function extraerExcel(string $rutaArchivo): array
    {
        $spreadsheet = IOFactory::load($rutaArchivo);
        $worksheet = $spreadsheet->getActiveSheet();
        $data = $worksheet->toArray();

        if (empty($data)) {
            return [
                'headers' => [],
                'rows' => [],
                'total_rows' => 0,
            ];
        }

        $headers = array_shift($data);
        $headers = array_map(fn($h) => $this->normalizarHeader($h), $headers);

        $rows = array_map(function($row) use ($headers) {
            $rowData = [];
            foreach ($headers as $index => $header) {
                $rowData[$header] = $row[$index] ?? null;
            }
            return $rowData;
        }, $data);

        $rows = array_filter($rows, function($row) {
            return !empty(array_filter($row, fn($val) => !is_null($val) && $val !== ''));
        });

        return [
            'headers' => $headers,
            'rows' => array_values($rows),
            'total_rows' => count($rows),
            'preview' => implode(', ', array_slice($headers, 0, 5)),
        ];
    }

    protected function extraerPdf(string $rutaArchivo): array
    {
        $parser = new PdfParser();
        $pdf = $parser->parseFile($rutaArchivo);
        $text = $pdf->getText();

        $lines = array_filter(
            array_map('trim', explode("\n", $text)),
            fn($line) => !empty($line)
        );

        $headers = $this->detectarHeadersPdf($lines);
        $rows = $this->parsearFilasPdf($lines, $headers);

        return [
            'headers' => $headers,
            'rows' => $rows,
            'total_rows' => count($rows),
            'preview' => substr($text, 0, 200),
            'text_completo' => $text,
        ];
    }

    protected function detectarHeadersPdf(array $lines): array
    {
        $possibleHeaders = ['nombre', 'dni', 'codigo', 'grado', 'seccion', 'nota', 'fecha'];
        $detectedHeaders = [];

        foreach ($lines as $index => $line) {
            if ($index > 10) break;

            $lineLower = strtolower($line);
            foreach ($possibleHeaders as $header) {
                if (str_contains($lineLower, $header)) {
                    $detectedHeaders[] = $header;
                }
            }

            if (count($detectedHeaders) >= 3) {
                break;
            }
        }

        return !empty($detectedHeaders) ? $detectedHeaders : ['columna_1', 'columna_2', 'columna_3'];
    }

    protected function parsearFilasPdf(array $lines, array $headers): array
    {
        $rows = [];
        foreach ($lines as $line) {
            $parts = preg_split('/\s{2,}|\t/', $line);
            if (count($parts) >= count($headers)) {
                $row = [];
                foreach ($headers as $index => $header) {
                    $row[$header] = $parts[$index] ?? null;
                }
                $rows[] = $row;
            }
        }
        return array_slice($rows, 0, 1000);
    }

    protected function extraerWord(string $rutaArchivo): array
    {
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($rutaArchivo);
        $text = '';

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                }
            }
        }

        $lines = array_filter(
            array_map('trim', explode("\n", $text)),
            fn($line) => !empty($line)
        );

        return [
            'headers' => ['linea'],
            'rows' => array_map(fn($line) => ['linea' => $line], $lines),
            'total_rows' => count($lines),
            'preview' => substr($text, 0, 200),
            'text_completo' => $text,
        ];
    }

    protected function normalizarHeader(?string $header): string
    {
        if (is_null($header) || trim($header) === '') {
            return 'columna_' . uniqid();
        }

        $normalized = strtolower(trim($header));
        $normalized = preg_replace('/[^a-z0-9_]/', '_', $normalized);
        $normalized = preg_replace('/_+/', '_', $normalized);
        $normalized = trim($normalized, '_');

        return $normalized ?: 'columna_' . uniqid();
    }

    public function obtenerPreview(string $rutaArchivo, string $mimeType, int $maxLineas = 5): string
    {
        try {
            $data = $this->extraer($rutaArchivo, $mimeType);
            
            if (isset($data['preview'])) {
                return $data['preview'];
            }

            $preview = implode(', ', $data['headers']) . "\n\n";
            $rowsToShow = array_slice($data['rows'], 0, $maxLineas);
            
            foreach ($rowsToShow as $row) {
                $preview .= implode(' | ', array_values($row)) . "\n";
            }

            return $preview;

        } catch (\Exception $e) {
            return "Error obteniendo preview: " . $e->getMessage();
        }
    }
}
