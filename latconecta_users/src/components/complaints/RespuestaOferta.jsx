import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const FRASE_ACEPTACION = 'ACUERDO ACEPTADO PARA SOLUCIONAR EL RECLAMO';

const RespuestaOferta = ({ showNotification }) => {
  const { numero } = useParams();
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [respondido, setRespondido] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!numero) return;
    apiClient.get(`/reclamaciones/oferta/${numero}`)
      .then(data => { setEstado(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [numero]);

  const responder = async (respuesta) => {
    if (respuesta === 'ACEPTADA' && !confirmado) return;
    setEnviando(true);
    try {
      const res = await apiClient.post('/reclamaciones/oferta/respuesta', { numero_correlativo: numero, respuesta });
      setRespondido(respuesta);
      if (showNotification) showNotification(
        respuesta === 'ACEPTADA' ? 'Propuesta aceptada correctamente.' : 'Propuesta rechazada.',
        'success'
      );
    } catch (e) {
      if (showNotification) showNotification('Error al procesar la respuesta. Intente nuevamente.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
    </div>
  );

  if (!estado) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <p className="text-red-600 font-semibold mb-4">Número de reclamación no encontrado.</p>
        <Link to="/" className="text-blue-700 underline text-sm">Volver al inicio</Link>
      </div>
    </div>
  );

  if (estado.estado !== 'OFERTA_ENVIADA' && !respondido) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <p className="text-gray-600 mb-2">Reclamación N° <strong>{numero}</strong></p>
        <p className="text-gray-500 text-sm">Estado actual: <span className="font-medium">{estado.estado}</span></p>
        <p className="text-gray-400 text-sm mt-2">No hay oferta pendiente de respuesta.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline text-sm">Volver al inicio</Link>
      </div>
    </div>
  );

  if (respondido) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">{respondido === 'ACEPTADA' ? '✅' : 'ℹ️'}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {respondido === 'ACEPTADA' ? 'Propuesta Aceptada' : 'Propuesta Rechazada'}
        </h2>
        {respondido === 'ACEPTADA' && (
          <p className="text-sm text-green-700 font-medium bg-green-50 rounded px-3 py-2 mb-3">
            {FRASE_ACEPTACION}
          </p>
        )}
        {respondido === 'RECHAZADA' && (
          <p className="text-sm text-gray-600 mb-3">
            Su reclamación continúa en proceso. El proveedor emitirá una respuesta formal.
          </p>
        )}
        <Link to="/" className="text-blue-700 underline text-sm">Volver al inicio</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Propuesta de Solución</h2>
        <p className="text-sm text-gray-500 mb-4">Reclamación N° <strong>{numero}</strong></p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-blue-600 font-semibold mb-1">PROPUESTA DEL PROVEEDOR</p>
          <p className="text-gray-700 text-sm">{estado.oferta_texto}</p>
        </div>

        <div className="border border-green-300 rounded-lg p-4 mb-4 bg-green-50">
          <p className="text-xs text-green-700 font-semibold mb-2">
            Si acepta, se registrará la siguiente declaración (Art. 6-A DS 101-2022):
          </p>
          <p className="text-green-800 font-bold text-sm">{FRASE_ACEPTACION}</p>
        </div>

        <label className="flex items-start gap-2 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={confirmado}
            onChange={e => setConfirmado(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">
            Acepto la propuesta de solución y declaro que esta reclamación queda resuelta con la frase:{' '}
            <strong>{FRASE_ACEPTACION}</strong>
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => responder('RECHAZADA')}
            disabled={enviando}
            className="flex-1 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Rechazar
          </button>
          <button
            onClick={() => responder('ACEPTADA')}
            disabled={!confirmado || enviando}
            className="flex-1 bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? 'Procesando...' : 'Aceptar Propuesta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespuestaOferta;
