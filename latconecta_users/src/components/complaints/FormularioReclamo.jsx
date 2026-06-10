import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import complaintsService from '../../services/complaintsService';
import latconectaService from '../../services/latconectaService';

const LEYENDA_ART13 = 'La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.';
const ACLARACION_RECLAMO = 'La reclamación no constituye una denuncia y en consecuencia no inicia un procedimiento administrativo sancionador.';
const ACLARACION_QUEJA   = 'La queja no constituye una denuncia.';

const INITIAL = {
  consumidor_nombre: '', consumidor_domicilio: '', consumidor_tipo_doc: 'DNI',
  consumidor_nro_doc: '', consumidor_telefono: '', consumidor_email: '',
  consumidor_menor_edad: false, representante_nombre: '', representante_telefono: '',
  representante_email: '', bien_tipo: 'SERVICIO', bien_descripcion: '', bien_monto: '',
  tipo_reclamacion: 'RECLAMO', detalle: '', pedido_concreto: '',
  canal_respuesta: 'CORREO_ELECTRONICO', direccion_correspondencia: '',
  purchase_id: '', confirmacion_veracidad: false, doc1_url: undefined, doc1_nombre: undefined, doc2_url: undefined, doc2_nombre: undefined,
};

const FormularioReclamo = ({ onSuccess, onBack, showNotification }) => {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [docs, setDocs]     = useState([null, null]); // hasta 2 documentos
  const [uploading, setUploading] = useState([false, false]);
  const [proveedor, setProveedor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    latconectaService.get().then(setProveedor).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        consumidor_nombre: user.user_name || '',
        consumidor_email:  user.user_email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const uploadDoc = async (index, file) => {
    if (!file) return;
    const MAX = 5 * 1024 * 1024;
    const ALLOWED = ['.jpg','.jpeg','.png','.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED.includes(ext)) {
      setErrors(prev => ({ ...prev, [`doc${index+1}`]: 'Formato no permitido. Use jpg, jpeg, png o pdf.' }));
      return;
    }
    if (file.size > MAX) {
      setErrors(prev => ({ ...prev, [`doc${index+1}`]: 'El archivo supera el límite de 5MB.' }));
      return;
    }
    setUploading(prev => { const n=[...prev]; n[index]=true; return n; });
    setErrors(prev => { const n={...prev}; delete n[`doc${index+1}`]; return n; });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/upload/reclamaciones-public', {
        method: 'POST', body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al subir el archivo');
      }
      const data = await res.json();
      setDocs(prev => {
        const n = [...prev];
        n[index] = { url: data.url, nombre: file.name };
        return n;
      });
      setForm(prev => ({
        ...prev,
        [`doc${index+1}_url`]:    data.url,
        [`doc${index+1}_nombre`]: file.name,
      }));
    } catch (e) {
      setErrors(prev => ({ ...prev, [`doc${index+1}`]: e.message }));
    } finally {
      setUploading(prev => { const n=[...prev]; n[index]=false; return n; });
    }
  };

  const removeDoc = (index) => {
    setDocs(prev => { const n=[...prev]; n[index]=null; return n; });
    setForm(prev => ({ ...prev, [`doc${index+1}_url`]: undefined, [`doc${index+1}_nombre`]: undefined }));
  };

  // useCallback evita que la función se recree en cada render
  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (!prev[field]) return prev; // evita re-render si no había error
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.consumidor_nombre.trim()) e.consumidor_nombre = 'Requerido';
    if (!form.consumidor_nro_doc.trim()) e.consumidor_nro_doc = 'Requerido';
    if (!form.consumidor_email.trim())
      e.consumidor_email = 'El correo electrónico es requerido para enviar la confirmación';
    if (form.consumidor_menor_edad && !form.representante_nombre.trim())
      e.representante_nombre = 'Requerido para menor de edad';
    if (!form.bien_descripcion.trim()) e.bien_descripcion = 'Requerido';
    if (!form.bien_monto || parseFloat(form.bien_monto) <= 0) e.bien_monto = 'Ingrese un monto válido';
    if (!form.detalle.trim() || form.detalle.length < 20) e.detalle = 'Mínimo 20 caracteres';
    if (!form.pedido_concreto.trim()) e.pedido_concreto = 'Requerido';
    if (form.canal_respuesta === 'CARTA' && !form.direccion_correspondencia.trim())
      e.direccion_correspondencia = 'Requerido cuando canal es CARTA';
    if (!form.confirmacion_veracidad) e.confirmacion_veracidad = 'Debe confirmar para continuar';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      // Mostrar primer error encontrado
      const primerError = Object.values(e)[0];
      if (showNotification) showNotification(primerError, 'error');
      else setErrors(prev => ({ ...prev, general: primerError }));
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        ...form,
        bien_monto: parseFloat(form.bien_monto),
        purchase_id: form.purchase_id ? parseInt(form.purchase_id) : undefined,
        consumidor_domicilio: form.consumidor_domicilio || undefined,
        direccion_correspondencia: form.direccion_correspondencia || undefined,
        representante_nombre: form.representante_nombre || undefined,
        representante_telefono: form.representante_telefono || undefined,
        representante_email: form.representante_email || undefined,
      };
      console.log('📋 Enviando reclamación:', payload);
      const resultado = await complaintsService.registrar(payload);
      console.log('✅ Reclamación registrada:', resultado);
      if (showNotification) showNotification('✅ Reclamación registrada correctamente. N°: ' + resultado.numero_correlativo, 'success');
      onSuccess(resultado);
    } catch (err) {
      console.error('❌ Error al registrar:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Error al registrar. Intente nuevamente.';
      if (showNotification) showNotification(msg, 'error');
      setErrors({ general: msg });
    } finally {
      setEnviando(false);
    }
  };

  const inp  = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const inpE = "w-full px-3 py-2 border border-red-400 rounded-lg text-sm focus:ring-2 focus:ring-red-400";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Cabecera — color corporativo amarillo */}
        <div className="bg-bitel-yellow px-6 py-5">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-bitel-blue hover:opacity-70 transition-opacity font-medium">
                ← Volver
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-bitel-blue">📋 Libro de Reclamaciones Virtual</h1>
              <p className="text-bitel-blue text-sm opacity-70">
                Conforme a la Ley N° 29571 — Código de Protección y Defensa del Consumidor
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* SECCIÓN A — PROVEEDOR */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Sección A — Datos del Proveedor
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Razón social:</span> {proveedor?.latconecta_name || '—'}</p>
              <p><span className="font-medium">Domicilio:</span> {proveedor?.latconecta_address || 'Miami, FL, USA'}</p>
              <p><span className="font-medium">Código de identificación:</span> LATCOM-VIRTUAL-001</p>
            </div>
          </section>

          {/* SECCIÓN B — CONSUMIDOR */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Sección B — Identificación del Consumidor
            </h2>
            {isAuthenticated && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded px-3 py-1.5 mb-3">
                Sus datos han sido pre-llenados. Puede modificarlos libremente.
              </p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                className={errors.consumidor_nombre ? inpE : inp}
                value={form.consumidor_nombre}
                onChange={e => set('consumidor_nombre', e.target.value)}
              />
              {errors.consumidor_nombre && <p className="text-red-500 text-xs mt-1">{errors.consumidor_nombre}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio</label>
              <input
                className={inp}
                placeholder="Calle, número, ciudad"
                value={form.consumidor_domicilio}
                onChange={e => set('consumidor_domicilio', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select
                  className={inp}
                  value={form.consumidor_tipo_doc}
                  onChange={e => set('consumidor_tipo_doc', e.target.value)}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carnet de Extranjería</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de documento <span className="text-red-500">*</span>
                </label>
                <input
                  className={errors.consumidor_nro_doc ? inpE : inp}
                  value={form.consumidor_nro_doc}
                  onChange={e => set('consumidor_nro_doc', e.target.value)}
                />
                {errors.consumidor_nro_doc && <p className="text-red-500 text-xs mt-1">{errors.consumidor_nro_doc}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={errors.consumidor_email ? inpE : inp}
                placeholder="correo@ejemplo.com"
                value={form.consumidor_email}
                onChange={e => set('consumidor_email', e.target.value)}
              />
              {errors.consumidor_email && <p className="text-red-500 text-xs mt-1">{errors.consumidor_email}</p>}
              <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">
                📧 Ingrese un correo válido para recibir la confirmación de su reclamación (Art. 4-B DS 006-2014).
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                className={inp}
                placeholder="999 999 999"
                value={form.consumidor_telefono}
                onChange={e => set('consumidor_telefono', e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={form.consumidor_menor_edad}
                onChange={e => set('consumidor_menor_edad', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">El consumidor es menor de edad</span>
            </label>

            {form.consumidor_menor_edad && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-yellow-700">Datos del representante</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del representante <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={errors.representante_nombre ? inpE : inp}
                    value={form.representante_nombre}
                    onChange={e => set('representante_nombre', e.target.value)}
                  />
                  {errors.representante_nombre && <p className="text-red-500 text-xs mt-1">{errors.representante_nombre}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del representante</label>
                  <input
                    className={inp}
                    value={form.representante_telefono}
                    onChange={e => set('representante_telefono', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email del representante</label>
                  <input
                    type="email"
                    className={inp}
                    value={form.representante_email}
                    onChange={e => set('representante_email', e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECCIÓN C — BIEN */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Sección C — Identificación del Bien Contratado
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de bien <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {[['PRODUCTO','Producto'],['SERVICIO','Servicio']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bien_tipo"
                      value={v}
                      checked={form.bien_tipo === v}
                      onChange={() => set('bien_tipo', v)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del bien o servicio <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                className={errors.bien_descripcion ? inpE : inp}
                value={form.bien_descripcion}
                onChange={e => set('bien_descripcion', e.target.value)}
              />
              {errors.bien_descripcion && <p className="text-red-500 text-xs mt-1">{errors.bien_descripcion}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto reclamado (S/) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={errors.bien_monto ? inpE : inp}
                value={form.bien_monto}
                onChange={e => set('bien_monto', e.target.value)}
              />
              {errors.bien_monto && <p className="text-red-500 text-xs mt-1">{errors.bien_monto}</p>}
            </div>
          </section>

          {/* SECCIÓN D — RECLAMACIÓN */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Sección D — Detalle de la Reclamación
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de reclamación <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mb-2">
                {[['RECLAMO','Reclamo'],['QUEJA','Queja']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_reclamacion"
                      value={v}
                      checked={form.tipo_reclamacion === v}
                      onChange={() => set('tipo_reclamacion', v)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-1.5">
                {form.tipo_reclamacion === 'RECLAMO' ? ACLARACION_RECLAMO : ACLARACION_QUEJA}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detalle de la reclamación <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className={errors.detalle ? inpE : inp}
                placeholder="Describa detalladamente lo ocurrido (mínimo 20 caracteres)"
                value={form.detalle}
                onChange={e => set('detalle', e.target.value)}
              />
              {errors.detalle && <p className="text-red-500 text-xs mt-1">{errors.detalle}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pedido concreto <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={errors.pedido_concreto ? inpE : inp}
                placeholder="¿Qué solución solicita?"
                value={form.pedido_concreto}
                onChange={e => set('pedido_concreto', e.target.value)}
              />
              {errors.pedido_concreto && <p className="text-red-500 text-xs mt-1">{errors.pedido_concreto}</p>}
            </div>
          </section>

          {/* CANAL DE RESPUESTA */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Canal de Respuesta Preferido
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deseo recibir la respuesta por <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {[['CORREO_ELECTRONICO','Correo electrónico'],['CARTA','Carta']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="canal_respuesta"
                      value={v}
                      checked={form.canal_respuesta === v}
                      onChange={() => set('canal_respuesta', v)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.canal_respuesta === 'CARTA' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección postal <span className="text-red-500">*</span>
                </label>
                <input
                  className={errors.direccion_correspondencia ? inpE : inp}
                  placeholder="Calle, número, distrito, ciudad"
                  value={form.direccion_correspondencia}
                  onChange={e => set('direccion_correspondencia', e.target.value)}
                />
                {errors.direccion_correspondencia && <p className="text-red-500 text-xs mt-1">{errors.direccion_correspondencia}</p>}
              </div>
            )}
          </section>

          {/* SECCIÓN E — CONFIRMACIÓN */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Sección E — Confirmación
            </h2>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirmacion_veracidad}
                onChange={e => set('confirmacion_veracidad', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                {form.consumidor_menor_edad
                  ? 'En calidad de representante del consumidor menor de edad, declaro que la información proporcionada es veraz y autorizo el registro de esta reclamación.'
                  : 'Declaro que la información proporcionada es veraz y autorizo el registro de esta reclamación.'
                }
              </span>
            </label>
            {errors.confirmacion_veracidad && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmacion_veracidad}</p>
            )}
          </section>

          {/* DOCUMENTOS ADJUNTOS — hasta 2 archivos, máx 5MB c/u */}
          <section>
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100 pb-1 mb-3">
              Documentos Adjuntos (Opcional)
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Puede adjuntar hasta 2 documentos como evidencia (jpg, jpeg, png, pdf — máx. 5MB c/u).
            </p>
            {[0, 1].map(idx => (
              <div key={idx} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento {idx + 1}
                </label>
                {docs[idx] ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-green-700 text-sm flex-1 truncate">✅ {docs[idx].nombre}</span>
                    <button
                      onClick={() => removeDoc(idx)}
                      className="text-red-500 text-xs hover:text-red-700 flex-shrink-0"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer
                      ${uploading[idx] ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                      transition-colors`}>
                      <span className="text-2xl">{uploading[idx] ? '⏳' : '📎'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {uploading[idx] ? 'Subiendo...' : 'Seleccionar archivo'}
                        </p>
                        <p className="text-xs text-gray-400">jpg, jpeg, png, pdf — máx. 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading[idx]}
                        onChange={e => { if (e.target.files[0]) uploadDoc(idx, e.target.files[0]); e.target.value=''; }}
                      />
                    </label>
                  </div>
                )}
                {errors[`doc${idx+1}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`doc${idx+1}`]}</p>
                )}
              </div>
            ))}
          </section>

          {/* LEYENDA LEGAL — Art. 13 DS 011-2011 */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-xs text-yellow-800">{LEYENDA_ART13}</p>
          </div>

          {errors.general && (
            <p className="text-red-600 text-sm bg-red-50 rounded px-3 py-2">{errors.general}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={enviando}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold text-sm
                       hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? '⏳ Registrando...' : 'Registrar Reclamación'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default FormularioReclamo;
