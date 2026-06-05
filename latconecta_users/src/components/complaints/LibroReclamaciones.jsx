import { useState } from 'react';
import FormularioReclamo from './FormularioReclamo';
import ConfirmacionReclamo from './ConfirmacionReclamo';
import ConsultaReclamo from './ConsultaReclamo';

const LibroReclamaciones = ({ showNotification }) => {
  const [vista, setVista] = useState('menu'); // menu | crear | consultar | confirmacion
  const [resultado, setResultado] = useState(null);

  if (vista === 'confirmacion' && resultado) {
    return (
      <ConfirmacionReclamo
        resultado={resultado}
        onNuevo={() => { setResultado(null); setVista('menu'); }}
      />
    );
  }

  if (vista === 'crear') {
    return (
      <FormularioReclamo
        onSuccess={(r) => { setResultado(r); setVista('confirmacion'); }}
        onBack={() => setVista('menu')}
        showNotification={showNotification}
      />
    );
  }

  if (vista === 'consultar') {
    return (
      <ConsultaReclamo
        onBack={() => setVista('menu')}
        showNotification={showNotification}
      />
    );
  }

  // Menú principal
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full">
        {/* Header amarillo corporativo */}
        <div className="bg-bitel-yellow px-6 py-6 text-center">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold text-bitel-blue">Libro de Reclamaciones</h1>
          <p className="text-bitel-blue text-sm mt-1 opacity-80">
            Conforme a la Ley N° 29571
          </p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm text-center">
            ¿Qué desea hacer?
          </p>

          <button
            onClick={() => setVista('crear')}
            className="w-full bg-bitel-yellow text-bitel-blue py-4 px-6 rounded-xl
                       font-bold text-base hover:bg-yellow-400 transition-colors
                       flex items-center gap-4 shadow-sm"
          >
            <span className="text-2xl">✏️</span>
            <div className="text-left">
              <p className="font-bold">Registrar Reclamo o Queja</p>
              <p className="text-xs font-normal opacity-70">Presentar una nueva reclamación</p>
            </div>
          </button>

          <button
            onClick={() => setVista('consultar')}
            className="w-full bg-white border-2 border-bitel-yellow text-bitel-blue py-4 px-6
                       rounded-xl font-bold text-base hover:bg-yellow-50 transition-colors
                       flex items-center gap-4 shadow-sm"
          >
            <span className="text-2xl">🔍</span>
            <div className="text-left">
              <p className="font-bold">Consultar Estado</p>
              <p className="text-xs font-normal opacity-70">Ver el estado de una reclamación existente</p>
            </div>
          </button>

          <p className="text-xs text-gray-400 text-center pt-2">
            Para consultar necesitará su número de reclamación y número de documento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LibroReclamaciones;
