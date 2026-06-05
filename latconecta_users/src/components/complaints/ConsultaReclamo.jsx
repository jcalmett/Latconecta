import { useState } from 'react';
import apiClient from '../../services/apiClient';

const ESTADOS = {
  PENDIENTE:      { label: 'Pendiente',         color: 'bg-gray-100 text-gray-700',   icon: '🕐' },
  EN_PROCESO:     { label: 'En Proceso',         color: 'bg-blue-100 text-blue-700',   icon: '⚙️' },
  OFERTA_ENVIADA: { label: 'Propuesta Enviada',  color: 'bg-yellow-100 text-yellow-700', icon: '📨' },
  RESPONDIDO:     { label: 'Respondido',         color: 'bg-green-100 text-green-700', icon: '✅' },
  CERRADO:        { label: 'Cerrado',            color: 'bg-gray-200 text-gray-600',   icon: '🔒' },
};

const ConsultaReclamo = ({ onBack, showNotification }) => {
  const [form, setForm]       = useState({ numero_correlativo: '', consumidor_nro_doc: '' });
  const [resultado, setResult] = useState(null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');

  const normalizarNumero = (n) => {
    n = n.trim();
    if (!n.includes('-') && n.length === 12) return n.slice(0, 8) + '-' + n.slice(8);
    return n;
  };

  const consultar = async () => {
    if (!form.numero_correlativo.trim() || !form.consumidor_nro_doc.trim()) {
      setError('Ingrese el número de reclamación y su número de documento.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = { ...form, numero_correlativo: normalizarNumero(form.numero_correlativo) };
      const data = await apiClient.post('/reclamaciones/consultar', payload);
      setResult(data);
    } catch (e) {
      setError(e.message || 'No se encontró la reclamación. Verifique los datos ingresados.');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent";

  const estado = resultado ? (ESTADOS[resultado.estado] || { label: resultado.estado, color: 'bg-gray-100 text-gray-700', icon: '—' }) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header amarillo corporativo */}
        <div className="bg-bitel-yellow px-6 py-5">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-bitel-blue hover:opacity-70 transition-opacity">
              ← Volver
            </button>
            <div>
              <h1 className="text-lg font-bold text-bitel-blue">Consultar Estado de Reclamación</h1>
              <p className="text-bitel-blue text-xs opacity-70">Libro de Reclamaciones Virtual</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de reclamación <span className="text-red-500">*</span>
              </label>
              <input
                className={inp}
                placeholder="Ej: 00000001-2026 o 000000012026"
                value={form.numero_correlativo}
                onChange={e => setForm(p => ({ ...p, numero_correlativo: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de documento (DNI o CE) <span className="text-red-500">*</span>
              </label>
              <input
                className={inp}
                placeholder="Ej: 12345678"
                value={form.consumidor_nro_doc}
                onChange={e => setForm(p => ({ ...p, consumidor_nro_doc: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={consultar}
            disabled={loading}
            className="w-full bg-bitel-yellow text-bitel-blue py-3 rounded-lg font-bold text-sm
                       hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {loading ? '🔍 Consultando...' : '🔍 Consultar Estado'}
          </button>

          {/* Resultado */}
          {resultado && (
            <div className="mt-6 border border-yellow-200 rounded-xl overflow-hidden">
              <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">N° de Reclamación</p>
                    <p className="font-bold text-bitel-blue text-lg tracking-wider">
                      {resultado.numero_correlativo}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${estado.color}`}>
                    {estado.icon} {estado.label}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Tipo</p>
                    <p className="font-medium">{resultado.tipo_reclamacion === 'RECLAMO' ? 'Reclamo' : 'Queja'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fecha de registro</p>
                    <p className="font-medium">
                      {new Date(resultado.fecha_registro).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fecha límite de respuesta</p>
                    <p className="font-medium text-red-600">
                      {new Date(resultado.fecha_limite_respuesta + 'T00:00:00').toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Canal de respuesta</p>
                    <p className="font-medium">
                      {resultado.canal_respuesta === 'CORREO_ELECTRONICO' ? '📧 Correo' : '✉️ Carta'}
                    </p>
                  </div>
                </div>

                {resultado.acuse_enviado && (
                  <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
                    ✅ Constancia de recepción enviada a su correo electrónico.
                  </div>
                )}

                {resultado.estado === 'OFERTA_ENVIADA' && resultado.oferta_texto && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">PROPUESTA DE SOLUCIÓN PENDIENTE</p>
                    <p className="text-sm text-gray-700">{resultado.oferta_texto}</p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Revise su correo para responder a esta propuesta.
                    </p>
                  </div>
                )}

                {resultado.oferta_respuesta && (
                  <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    resultado.oferta_respuesta === 'ACEPTADA'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    Propuesta {resultado.oferta_respuesta === 'ACEPTADA' ? 'aceptada ✅' : 'rechazada — en espera de respuesta formal ℹ️'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaReclamo;
