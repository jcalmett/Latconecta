import { useState, useEffect, useCallback } from 'react';
import complaintsAdminService from '../../services/complaintsAdminService';

const ESTADOS  = ['PENDIENTE','EN_PROCESO','OFERTA_ENVIADA','RESPONDIDO','CERRADO'];
const TIPOS    = ['RECLAMO','QUEJA'];
const CANALES  = ['CORREO_ELECTRONICO','CARTA'];

const semaforo = (dias) => {
  if (dias === null || dias === undefined) return { color: 'bg-gray-200 text-gray-600', label: '—' };
  if (dias >= 8) return { color: 'bg-green-100 text-green-800',   label: `${dias}d` };
  if (dias >= 4) return { color: 'bg-yellow-100 text-yellow-800', label: `${dias}d` };
  if (dias >= 1) return { color: 'bg-orange-100 text-orange-800', label: `${dias}d` };
  return { color: 'bg-red-100 text-red-800', label: dias <= 0 ? 'VENCIDO' : `${dias}d` };
};

const estadoBadge = (e) => ({
  PENDIENTE:'bg-gray-100 text-gray-700', EN_PROCESO:'bg-blue-100 text-blue-700',
  OFERTA_ENVIADA:'bg-yellow-100 text-yellow-700', RESPONDIDO:'bg-green-100 text-green-700',
  CERRADO:'bg-gray-300 text-gray-600',
}[e] || 'bg-gray-100 text-gray-600');

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-PE') : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-PE') : '—';

const ReclamacionesTab = ({ showNotification }) => {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip]       = useState(0);
  const [filtros, setFiltros] = useState({ estado:'', tipo:'', canal:'', vencimiento_proximo:false });
  const [selected, setSelected] = useState(null);
  const [detalle, setDetalle]   = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ estado:'', respuesta_proveedor:'', responsable_interno:'', oferta_texto:'' });
  const [guardando, setGuardando] = useState(false);
  const [tabDetalle, setTabDetalle] = useState('reclamo'); // reclamo | gestion | documentos | ofertas

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { skip, limit: 50, ...filtros };
      if (!params.estado) delete params.estado;
      if (!params.tipo)   delete params.tipo;
      if (!params.canal)  delete params.canal;
      const data = await complaintsAdminService.listar(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { showNotification('Error al cargar reclamaciones', 'error'); }
    finally { setLoading(false); }
  }, [skip, filtros, showNotification]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirModal = async (item) => {
    setSelected(item);
    setTabDetalle('reclamo');
    setForm({ estado: item.estado||'', respuesta_proveedor:'', responsable_interno: item.responsable_interno||'', oferta_texto:'' });
    setModal(true);
    try {
      const d = await complaintsAdminService.detalle(item.id);
      setDetalle(d);
    } catch { setDetalle(null); }
  };

  const guardar = async () => {
    if (!selected) return;
    setGuardando(true);
    try {
      const payload = {};
      if (form.estado && form.estado !== selected.estado) payload.estado = form.estado;
      if (form.respuesta_proveedor.trim())  payload.respuesta_proveedor = form.respuesta_proveedor;
      if (form.responsable_interno.trim())  payload.responsable_interno = form.responsable_interno;
      if (form.oferta_texto.trim())         payload.oferta_texto = form.oferta_texto;
      await complaintsAdminService.actualizar(selected.id, payload);
      showNotification('Reclamación actualizada', 'success');
      setModal(false);
      cargar();
    } catch { showNotification('Error al guardar', 'error'); }
    finally { setGuardando(false); }
  };

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008C96]";
  const complaint = detalle?.complaint || selected;
  const ofertas   = detalle?.ofertas   || [];

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setTabDetalle(id)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        tabDetalle === id
          ? 'border-[#008C96] text-[#008C96]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#008C96]">📋 Libro de Reclamaciones</h2>
          <p className="text-sm text-gray-500 mt-0.5">Total: {total} reclamación(es)</p>
        </div>
        <button onClick={() => complaintsAdminService.exportarCSV()}
          className="bg-[#008C96] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700">
          ⬇ Exportar CSV (INDECOPI)
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select className={inp} value={filtros.estado} onChange={e => setFiltros(p=>({...p,estado:e.target.value}))}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={inp} value={filtros.tipo} onChange={e => setFiltros(p=>({...p,tipo:e.target.value}))}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={inp} value={filtros.canal} onChange={e => setFiltros(p=>({...p,canal:e.target.value}))}>
          <option value="">Todos los canales</option>
          {CANALES.map(c => <option key={c} value={c}>{c==='CORREO_ELECTRONICO'?'Correo':'Carta'}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={filtros.vencimiento_proximo}
            onChange={e => setFiltros(p=>({...p,vencimiento_proximo:e.target.checked}))}
            className="w-4 h-4 rounded border-gray-300 text-[#008C96]" />
          Próximos a vencer (≤3d)
        </label>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008C96]" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay reclamaciones que coincidan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#008C96] text-white">
                {['N° Correlativo','Fecha','Tipo','Consumidor','Canal','Estado','Plazo','Docs','Acción'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const sem = semaforo(item.dias_restantes);
                const hasDocs = item.doc1_url || item.doc2_url;
                return (
                  <tr key={item.id} className={idx%2===0?'bg-white':'bg-gray-50'}>
                    <td className="px-3 py-3 font-mono text-xs font-bold text-[#008C96]">{item.numero_correlativo}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(item.fecha_registro)}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.tipo_reclamacion==='RECLAMO'?'bg-red-100 text-red-700':'bg-purple-100 text-purple-700'}`}>
                        {item.tipo_reclamacion}
                      </span>
                    </td>
                    <td className="px-3 py-3 max-w-[140px] truncate">{item.consumidor_nombre}</td>
                    <td className="px-3 py-3 text-xs">{item.canal_respuesta==='CORREO_ELECTRONICO'?'📧':'✉️ Carta'}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${estadoBadge(item.estado)}`}>{item.estado}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${sem.color}`}>{sem.label}</span>
                    </td>
                    <td className="px-3 py-3 text-center">{hasDocs ? '📎' : '—'}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => abrirModal(item)}
                        className="bg-[#008C96] text-white px-3 py-1 rounded text-xs hover:bg-teal-700">
                        Ver / Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle y gestión */}
      {modal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#008C96] px-6 py-4 text-white flex justify-between items-center rounded-t-xl flex-shrink-0">
              <div>
                <h3 className="font-bold text-lg">Reclamación {selected.numero_correlativo}</h3>
                <p className="text-teal-200 text-xs">{selected.tipo_reclamacion} — {selected.estado}</p>
              </div>
              <button onClick={() => setModal(false)} className="text-white hover:text-gray-200 text-xl">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4 flex-shrink-0">
              <TabBtn id="reclamo"    label="📄 Reclamo" />
              <TabBtn id="gestion"   label="⚙️ Gestión" />
              <TabBtn id="documentos" label="📎 Documentos" />
              <TabBtn id="ofertas"   label="🤝 Ofertas" />
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* Tab: Reclamo completo */}
              {tabDetalle === 'reclamo' && complaint && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-[#008C96] uppercase mb-2">Sección A — Proveedor</p>
                    <div className="bg-gray-50 rounded p-3 space-y-1 text-xs">
                      <p><span className="font-medium">Razón social:</span> {complaint.proveedor_razon_social}</p>
                      <p><span className="font-medium">Domicilio:</span> {complaint.proveedor_domicilio}</p>
                      <p><span className="font-medium">Código:</span> {complaint.codigo_identificacion}</p>
                      <p><span className="font-medium">Fecha registro:</span> {fmtDateTime(complaint.fecha_registro)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008C96] uppercase mb-2">Sección B — Consumidor</p>
                    <div className="bg-gray-50 rounded p-3 space-y-1 text-xs">
                      <p><span className="font-medium">Nombre:</span> {complaint.consumidor_nombre}</p>
                      <p><span className="font-medium">Documento:</span> {complaint.consumidor_tipo_doc} {complaint.consumidor_nro_doc}</p>
                      <p><span className="font-medium">Email:</span> {complaint.consumidor_email}</p>
                      {complaint.consumidor_telefono && <p><span className="font-medium">Teléfono:</span> {complaint.consumidor_telefono}</p>}
                      {complaint.consumidor_domicilio && <p><span className="font-medium">Domicilio:</span> {complaint.consumidor_domicilio}</p>}
                      {complaint.consumidor_menor_edad && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <p className="font-medium text-yellow-700">Menor de edad</p>
                          <p><span className="font-medium">Representante:</span> {complaint.representante_nombre}</p>
                          {complaint.representante_email && <p><span className="font-medium">Email rep.:</span> {complaint.representante_email}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008C96] uppercase mb-2">Sección C — Bien contratado</p>
                    <div className="bg-gray-50 rounded p-3 space-y-1 text-xs">
                      <p><span className="font-medium">Tipo:</span> {complaint.bien_tipo}</p>
                      <p><span className="font-medium">Descripción:</span> {complaint.bien_descripcion}</p>
                      <p><span className="font-medium">Monto reclamado:</span> S/ {parseFloat(complaint.bien_monto||0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008C96] uppercase mb-2">Sección D — Detalle de la reclamación</p>
                    <div className="bg-gray-50 rounded p-3 space-y-2 text-xs">
                      <p><span className="font-medium">Tipo:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded font-semibold ${complaint.tipo_reclamacion==='RECLAMO'?'bg-red-100 text-red-700':'bg-purple-100 text-purple-700'}`}>
                          {complaint.tipo_reclamacion}
                        </span>
                      </p>
                      <div>
                        <p className="font-medium mb-1">Detalle:</p>
                        <p className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap">{complaint.detalle}</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Pedido concreto:</p>
                        <p className="bg-white border border-gray-200 rounded p-2 whitespace-pre-wrap">{complaint.pedido_concreto}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#008C96] uppercase mb-2">Canal de respuesta</p>
                    <div className="bg-gray-50 rounded p-3 text-xs">
                      <p><span className="font-medium">Canal elegido:</span> {complaint.canal_respuesta==='CORREO_ELECTRONICO'?'📧 Correo electrónico':'✉️ Carta'}</p>
                      {complaint.direccion_correspondencia && <p><span className="font-medium">Dirección:</span> {complaint.direccion_correspondencia}</p>}
                      <p><span className="font-medium">Fecha límite respuesta:</span> <strong className="text-red-600">{fmtDate(complaint.fecha_limite_respuesta)}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Gestión */}
              {tabDetalle === 'gestion' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select className={inp} value={form.estado}
                      onChange={e => setForm(p=>({...p,estado:e.target.value}))}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable interno</label>
                    <input className={inp} value={form.responsable_interno}
                      onChange={e => setForm(p=>({...p,responsable_interno:e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta formal al consumidor</label>
                    <textarea rows={4} className={inp} value={form.respuesta_proveedor}
                      placeholder="Respuesta formal que se registrará en el expediente y se enviará al consumidor por el canal elegido"
                      onChange={e => setForm(p=>({...p,respuesta_proveedor:e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Propuesta de solución (oferta al consumidor)
                    </label>
                    <textarea rows={3} className={inp} value={form.oferta_texto}
                      placeholder="Al guardar con texto aquí → estado OFERTA_ENVIADA + email al consumidor con link para aceptar/rechazar"
                      onChange={e => setForm(p=>({...p,oferta_texto:e.target.value}))} />
                    {form.oferta_texto.trim() && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-1">
                        ⚠ Se enviará email al consumidor con la propuesta y link para responder.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button onClick={guardar} disabled={guardando}
                      className="flex-1 bg-[#008C96] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Documentos */}
              {tabDetalle === 'documentos' && (
                <div className="space-y-4">
                  {!complaint?.doc1_url && !complaint?.doc2_url ? (
                    <p className="text-gray-400 text-sm text-center py-8">No se adjuntaron documentos a esta reclamación.</p>
                  ) : (
                    [['doc1_url','doc1_nombre',1],['doc2_url','doc2_nombre',2]].map(([urlKey, nombreKey, num]) => (
                      complaint?.[urlKey] && (
                        <div key={num} className="border border-gray-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Documento {num}</p>
                          <p className="text-xs text-gray-500 mb-3">{complaint[nombreKey] || 'Sin nombre'}</p>
                          {/\.(jpg|jpeg|png)$/i.test(complaint[urlKey]) ? (
                            <img
                              src={complaint[urlKey]}
                              alt={`Documento ${num}`}
                              className="max-w-full max-h-80 rounded border border-gray-200 object-contain"
                            />
                          ) : (
                            <a
                              href={complaint[urlKey]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#008C96] text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700"
                            >
                              📄 Ver PDF
                            </a>
                          )}
                        </div>
                      )
                    ))
                  )}
                </div>
              )}

              {/* Tab: Historial de ofertas */}
              {tabDetalle === 'ofertas' && (
                <div className="space-y-3">
                  {ofertas.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No se han enviado propuestas de solución.</p>
                  ) : (
                    ofertas.map((o, idx) => (
                      <div key={o.id} className={`border rounded-lg p-4 ${o.respuesta==='ACEPTADA'?'border-green-200 bg-green-50':o.respuesta==='RECHAZADA'?'border-red-200 bg-red-50':'border-yellow-200 bg-yellow-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-600">Propuesta {idx+1}</p>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${o.respuesta==='ACEPTADA'?'bg-green-100 text-green-700':o.respuesta==='RECHAZADA'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                            {o.respuesta || 'PENDIENTE'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{o.oferta_texto}</p>
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <p>Enviada: {fmtDateTime(o.enviada_at)} — por {o.enviada_por || '—'}</p>
                          {o.respuesta_at && <p>Respondida: {fmtDateTime(o.respuesta_at)}</p>}
                          {o.observacion && <p>Observación: {o.observacion}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamacionesTab;
