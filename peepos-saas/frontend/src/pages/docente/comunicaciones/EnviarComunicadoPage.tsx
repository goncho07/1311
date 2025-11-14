/**
 * ═══════════════════════════════════════════════════════════
 * ENVIAR COMUNICADO - Panel Docente
 * ═══════════════════════════════════════════════════════════
 * Envío de comunicaciones a apoderados
 * - Selección de sección
 * - Tipo: Informativo, Urgente, Citación
 * - Destinatarios: Todos o selectivo
 * - Envío por correo y WhatsApp (integración WAHA)
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, Send, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { docenteApi } from '../../../api/endpoints/docente';

export default function EnviarComunicadoPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [seccionId, setSeccionId] = useState<string>('');
  const [asunto, setAsunto] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');
  const [tipo, setTipo] = useState<'INFORMATIVO' | 'URGENTE' | 'CITACION'>('INFORMATIVO');
  const [destinatarios, setDestinatarios] = useState<'TODOS' | 'SELECTIVO'>('TODOS');

  const handleEnviar = async () => {
    if (!asunto.trim() || !mensaje.trim()) {
      setError('El asunto y el mensaje son obligatorios');
      return;
    }

    try {
      setSending(true);
      setError(null);

      await docenteApi.enviarComunicado({
        seccion_id: seccionId,
        asunto,
        mensaje,
        tipo,
        destinatarios,
      });

      setSuccess('Comunicado enviado correctamente');
      setAsunto('');
      setMensaje('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al enviar comunicado');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-6">
        <Link to="/dashboard-docente" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Enviar Comunicado</h1>
        <p className="text-gray-600">Comunicación con Apoderados</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">✕</button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center mt-0.5">✓</div>
            <p className="text-green-800 flex-1">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Tipo de Comunicado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Comunicado</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipo('INFORMATIVO')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tipo === 'INFORMATIVO' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Informativo
              </button>
              <button
                onClick={() => setTipo('URGENTE')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tipo === 'URGENTE' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Urgente
              </button>
              <button
                onClick={() => setTipo('CITACION')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tipo === 'CITACION' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Citación
              </button>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asunto *</label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Reunión de apoderados - 15 de noviembre"
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe aquí el contenido del comunicado..."
            />
            <p className="text-sm text-gray-500 mt-2">{mensaje.length} caracteres</p>
          </div>

          {/* Canal de Envío */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Canal de Envío</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900">Correo Electrónico</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-blue-900">WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Botón Enviar */}
          <div className="flex gap-3">
            <button
              onClick={handleEnviar}
              disabled={sending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Enviando...' : 'Enviar Comunicado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
