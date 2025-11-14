<?php

namespace App\Services\Import;

use App\Models\Usuario;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Validator;

class ValidationEngine
{
    protected SchemaMapper $schemaMapper;

    public function __construct(SchemaMapper $schemaMapper)
    {
        $this->schemaMapper = $schemaMapper;
    }

    public function validar(string $modulo, array $datosMapeados): array
    {
        $errores = [];
        $advertencias = [];
        $accionSugerida = 'CREAR';

        $erroresRequeridos = $this->validarCamposRequeridos($modulo, $datosMapeados);
        if (!empty($erroresRequeridos)) {
            $errores = array_merge($errores, $erroresRequeridos);
        }

        $erroresFormato = $this->validarFormatos($modulo, $datosMapeados);
        if (!empty($erroresFormato)) {
            $errores = array_merge($errores, $erroresFormato);
        }

        $resultadoDuplicado = $this->verificarDuplicado($modulo, $datosMapeados);
        if ($resultadoDuplicado['es_duplicado']) {
            $advertencias[] = $resultadoDuplicado['mensaje'];
            $accionSugerida = 'ACTUALIZAR';
        }

        $estado = empty($errores) ? 'VALIDO' : 'INVALIDO';
        if ($estado === 'VALIDO' && $resultadoDuplicado['es_duplicado']) {
            $estado = 'DUPLICADO';
        }

        return [
            'estado_validacion' => $estado,
            'errores_validacion' => $errores,
            'advertencias' => $advertencias,
            'accion_sugerida' => $accionSugerida,
        ];
    }

    protected function validarCamposRequeridos(string $modulo, array $datos): array
    {
        $errores = [];
        $camposRequeridos = $this->schemaMapper->obtenerCamposRequeridos($modulo);

        foreach ($camposRequeridos as $campo) {
            if (empty($datos[$campo])) {
                $errores[] = "El campo '{$campo}' es requerido";
            }
        }

        return $errores;
    }

    protected function validarFormatos(string $modulo, array $datos): array
    {
        $errores = [];

        if (isset($datos['dni'])) {
            if (!preg_match('/^\d{8}$/', $datos['dni'])) {
                $errores[] = 'El DNI debe tener 8 dígitos';
            }
        }

        if (isset($datos['email']) && !empty($datos['email'])) {
            if (!filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
                $errores[] = 'El email no tiene un formato válido';
            }
        }

        if (isset($datos['telefono']) && !empty($datos['telefono'])) {
            if (!preg_match('/^\d{9}$/', $datos['telefono'])) {
                $errores[] = 'El teléfono debe tener 9 dígitos';
            }
        }

        if (isset($datos['fecha'])) {
            if (!$this->validarFecha($datos['fecha'])) {
                $errores[] = 'La fecha no tiene un formato válido';
            }
        }

        return $errores;
    }

    protected function verificarDuplicado(string $modulo, array $datos): array
    {
        $resultado = ['es_duplicado' => false, 'mensaje' => ''];

        if ($modulo === 'USUARIOS' && isset($datos['dni'])) {
            $existente = Usuario::where('dni', $datos['dni'])->first();
            if ($existente) {
                return [
                    'es_duplicado' => true,
                    'mensaje' => "Ya existe un usuario con DNI {$datos['dni']} (ID: {$existente->id})",
                ];
            }
        }

        if ($modulo === 'USUARIOS' && isset($datos['codigo_usuario'])) {
            $existente = Usuario::where('codigo_usuario', $datos['codigo_usuario'])->first();
            if ($existente) {
                return [
                    'es_duplicado' => true,
                    'mensaje' => "Ya existe un usuario con código {$datos['codigo_usuario']}",
                ];
            }
        }

        return $resultado;
    }

    protected function validarFecha(?string $fecha): bool
    {
        if (empty($fecha)) {
            return false;
        }

        $d = \DateTime::createFromFormat('Y-m-d', $fecha);
        return $d && $d->format('Y-m-d') === $fecha;
    }
}
