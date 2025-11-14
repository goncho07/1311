<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Docente\CreateTareaRequest;
use App\Http\Requests\Docente\UpdateTareaRequest;
use App\Http\Requests\Docente\CalificarEntregaRequest;
use App\Http\Resources\TareaResource;
use App\Http\Resources\EntregaResource;
use App\Services\Docente\TareasService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TareasController extends Controller
{
    protected $tareasService;

    public function __construct(TareasService $tareasService)
    {
        $this->tareasService = $tareasService;
    }

    public function index(Request $request): JsonResponse
    {
        $tareas = $this->tareasService->list($request->all());

        return response()->json([
            'data' => TareaResource::collection($tareas),
            'meta' => [
                'total' => $tareas->total(),
                'current_page' => $tareas->currentPage(),
                'per_page' => $tareas->perPage()
            ]
        ]);
    }

    public function store(CreateTareaRequest $request): JsonResponse
    {
        $tarea = $this->tareasService->create($request->validated());

        return response()->json([
            'message' => 'Tarea creada exitosamente',
            'data' => new TareaResource($tarea)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tarea = $this->tareasService->findById($id);

        return response()->json([
            'data' => new TareaResource($tarea)
        ]);
    }

    public function update(UpdateTareaRequest $request, int $id): JsonResponse
    {
        $tarea = $this->tareasService->update($id, $request->validated());

        return response()->json([
            'message' => 'Tarea actualizada exitosamente',
            'data' => new TareaResource($tarea)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->tareasService->delete($id);

        return response()->json([
            'message' => 'Tarea eliminada exitosamente'
        ]);
    }

    public function verEntregas(int $id): JsonResponse
    {
        $entregas = $this->tareasService->getEntregas($id);

        return response()->json([
            'data' => EntregaResource::collection($entregas)
        ]);
    }

    public function calificarEntrega(CalificarEntregaRequest $request, int $id): JsonResponse
    {
        $entrega = $this->tareasService->calificarEntrega($id, $request->validated());

        return response()->json([
            'message' => 'Entrega calificada exitosamente',
            'data' => new EntregaResource($entrega)
        ]);
    }
}
