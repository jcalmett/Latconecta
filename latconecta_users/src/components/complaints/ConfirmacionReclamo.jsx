import { Link } from 'react-router-dom';

const LEYENDA = 'La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.';

const ConfirmacionReclamo = ({ resultado, onNuevo }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reclamación Registrada</h2>
        <p className="text-gray-600 text-sm">
          {resultado.tipo_reclamacion === 'RECLAMO' ? 'Reclamo' : 'Queja'} recibido/a correctamente.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-center">
        <p className="text-xs text-blue-600 font-semibold mb-1">N° DE RECLAMACIÓN</p>
        <p className="text-2xl font-bold text-blue-800 tracking-widest">{resultado.numero_correlativo}</p>
        <p className="text-xs text-blue-600 mt-1">Guarde este número para consultar el estado</p>
      </div>

      <div className="text-sm text-gray-600 space-y-2 mb-4">
        <p><span className="font-medium">Fecha límite de respuesta:</span>{' '}
          {new Date(resultado.fecha_limite_respuesta + 'T00:00:00').toLocaleDateString('es-PE')}
        </p>
        <p><span className="font-medium">Canal de respuesta:</span>{' '}
          {resultado.canal_respuesta === 'CORREO_ELECTRONICO' ? 'Correo electrónico' : 'Carta al domicilio'}
        </p>
        {resultado.acuse_enviado && (
          <p className="text-green-700">✉ Acuse de recibo enviado a su correo electrónico.</p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
        <p className="text-xs text-yellow-800">{LEYENDA}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          🖨 Imprimir
        </button>
        <Link
          to="/"
          className="flex-1 bg-bitel-yellow text-bitel-blue px-4 py-2 rounded-lg text-sm font-semibold text-center hover:bg-yellow-400 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  </div>
);

export default ConfirmacionReclamo;
