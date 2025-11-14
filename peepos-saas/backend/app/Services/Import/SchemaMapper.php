<?php

namespace App\Services\Import;

class SchemaMapper
{
    protected array $mappings = [
        'USUARIOS' => [
            'table' => 'usuarios',
            'fields' => [
                'nombres' => ['nombres', 'nombre', 'name', 'primer_nombre'],
                'apellidos' => ['apellidos', 'apellido', 'apellido_paterno'],
                'dni' => ['dni', 'documento', 'num_documento'],
                'email' => ['email', 'correo', 'mail'],
                'telefono' => ['telefono', 'celular', 'phone'],
                'tipo_usuario' => ['tipo', 'tipo_usuario', 'rol'],
                'codigo_usuario' => ['codigo', 'codigo_usuario', 'id'],
            ],
            'required' => ['nombres', 'dni', 'tipo_usuario'],
        ],
        'ACADEMICO' => [
            'table' => 'evaluaciones',
            'fields' => [
                'codigo_estudiante' => ['codigo_estudiante', 'codigo', 'id_estudiante'],
                'area_curricular' => ['area', 'area_curricular', 'materia'],
                'competencia' => ['competencia', 'indicador'],
                'calificacion' => ['calificacion', 'nota', 'puntaje'],
                'bimestre' => ['bimestre', 'periodo', 'trimestre'],
            ],
            'required' => ['codigo_estudiante', 'area_curricular', 'calificacion'],
        ],
        'ASISTENCIA' => [
            'table' => 'asistencias',
            'fields' => [
                'codigo_estudiante' => ['codigo_estudiante', 'codigo'],
                'fecha' => ['fecha', 'date'],
                'estado' => ['estado', 'asistencia', 'presente'],
                'observaciones' => ['observaciones', 'obs', 'notas'],
            ],
            'required' => ['codigo_estudiante', 'fecha', 'estado'],
        ],
    ];

    public function mapear(string $modulo, array $datosOriginales): array
    {
        if (!isset($this->mappings[$modulo])) {
            throw new \Exception("Módulo no soportado: {$modulo}");
        }

        $mapping = $this->mappings[$modulo];
        $datosMapeados = [];

        foreach ($mapping['fields'] as $campoDestino => $posiblesNombres) {
            $valor = $this->encontrarValor($datosOriginales, $posiblesNombres);

            if ($valor !== null) {
                $datosMapeados[$campoDestino] = $this->normalizarValor($campoDestino, $valor);
            }
        }

        return $datosMapeados;
    }

    protected function encontrarValor(array $datos, array $posiblesNombres)
    {
        foreach ($posiblesNombres as $nombre) {
            $nombreLower = strtolower($nombre);

            foreach ($datos as $key => $value) {
                $keyLower = strtolower($key);

                if ($keyLower === $nombreLower || str_contains($keyLower, $nombreLower)) {
                    return $value;
                }
            }
        }

        return null;
    }

    protected function normalizarValor(string $campo, $valor)
    {
        if (is_null($valor) || $valor === '') {
            return null;
        }

        return match ($campo) {
            'dni' => preg_replace('/[^0-9]/', '', $valor),
            'email' => strtolower(trim($valor)),
            'telefono' => preg_replace('/[^0-9+]/', '', $valor),
            'nombres', 'apellidos' => mb_convert_case(trim($valor), MB_CASE_TITLE, 'UTF-8'),
            'tipo_usuario' => $this->normalizarTipoUsuario($valor),
            'calificacion' => $this->normalizarCalificacion($valor),
            'estado' => $this->normalizarEstadoAsistencia($valor),
            'fecha' => $this->normalizarFecha($valor),
            'bimestre' => $this->normalizarBimestre($valor),
            default => trim($valor),
        };
    }

    protected function normalizarTipoUsuario($valor): string
    {
        $valorLower = strtolower(trim($valor));

        return match ($valorLower) {
            'estudiante', 'alumno' => 'ESTUDIANTE',
            'docente', 'profesor', 'maestro' => 'DOCENTE',
            'apoderado', 'padre', 'madre', 'tutor' => 'APODERADO',
            'administrativo', 'admin' => 'ADMINISTRATIVO',
            default => strtoupper($valorLower),
        };
    }

    protected function normalizarCalificacion($valor): string
    {
        $valorStr = strtoupper(trim($valor));

        if (in_array($valorStr, ['AD', 'A', 'B', 'C'])) {
            return $valorStr;
        }

        $valorNum = (float) $valor;
        return match (true) {
            $valorNum >= 18 => 'AD',
            $valorNum >= 14 => 'A',
            $valorNum >= 11 => 'B',
            default => 'C',
        };
    }

    protected function normalizarEstadoAsistencia($valor): string
    {
        $valorLower = strtolower(trim($valor));

        return match ($valorLower) {
            'presente', 'p', 'asistio' => 'PRESENTE',
            'tardanza', 't' => 'TARDANZA',
            'justificado', 'j' => 'JUSTIFICADO',
            default => 'AUSENTE',
        };
    }

    protected function normalizarFecha($valor): ?string
    {
        if (empty($valor)) {
            return null;
        }

        try {
            if (is_numeric($valor)) {
                $timestamp = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToTimestamp($valor);
                return date('Y-m-d', $timestamp);
            }

            $fecha = new \DateTime($valor);
            return $fecha->format('Y-m-d');

        } catch (\Exception $e) {
            return null;
        }
    }

    protected function normalizarBimestre($valor): string
    {
        $valorStr = strtoupper(trim($valor));

        return match ($valorStr) {
            '1', 'I', 'PRIMERO' => 'I',
            '2', 'II', 'SEGUNDO' => 'II',
            '3', 'III', 'TERCERO' => 'III',
            '4', 'IV', 'CUARTO' => 'IV',
            default => 'I',
        };
    }

    public function obtenerCamposRequeridos(string $modulo): array
    {
        return $this->mappings[$modulo]['required'] ?? [];
    }

    public function obtenerEsquema(string $modulo): array
    {
        return $this->mappings[$modulo] ?? [];
    }
}
