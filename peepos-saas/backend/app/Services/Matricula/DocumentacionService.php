<?php

namespace App\Services\Matricula;

use App\Models\DocumentoMatricula;
use App\Models\Matricula;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;

class DocumentacionService
{
    /**
     * Subir documento de matrícula
     */
    public function subirDocumento(int $matriculaId, UploadedFile $file, string $tipoDocumento): DocumentoMatricula
    {
        try {
            $path = $file->store("matriculas/{$matriculaId}", 'private');

            $documento = DocumentoMatricula::create([
                'uuid' => \Str::uuid(),
                'matricula_id' => $matriculaId,
                'tipo_documento' => $tipoDocumento,
                'nombre_documento' => $file->getClientOriginalName(),
                'url_documento' => $path,
                'estado' => 'PENDIENTE',
                'fecha_subida' => now()
            ]);

            $this->verificarDocumentosCompletos($matriculaId);

            Log::info("Documento subido", ['documento_id' => $documento->id]);

            return $documento;

        } catch (\Exception $e) {
            Log::error("Error subiendo documento: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verificar si todos los documentos están completos
     */
    protected function verificarDocumentosCompletos(int $matriculaId): void
    {
        $matricula = Matricula::findOrFail($matriculaId);

        $documentosRequeridos = ['DNI', 'PARTIDA_NACIMIENTO', 'FOTO', 'CERTIFICADO_ESTUDIOS'];
        $documentosSubidos = DocumentoMatricula::where('matricula_id', $matriculaId)
                                               ->whereIn('tipo_documento', $documentosRequeridos)
                                               ->pluck('tipo_documento')
                                               ->toArray();

        $completos = count($documentosRequeridos) === count($documentosSubidos);

        $matricula->update(['documentos_completos' => $completos]);
    }

    /**
     * Verificar documento
     */
    public function verificarDocumento(int $documentoId): bool
    {
        $documento = DocumentoMatricula::findOrFail($documentoId);

        $documento->update([
            'estado' => 'VERIFICADO',
            'fecha_verificacion' => now(),
            'verificado_por' => auth()->id()
        ]);

        return true;
    }
}
