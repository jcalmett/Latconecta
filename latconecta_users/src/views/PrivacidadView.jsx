const PrivacidadView = () => {
  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-10">

          <h1 className="text-2xl font-bold text-bitel-blue mb-1">Política de Privacidad</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: 19 de junio de 2026</p>

          <p className="text-sm text-gray-700 mb-6">
            LATCOM HORIZONS PERU S.R.L., con nombre comercial <strong>Latconecta</strong>, RUC 20612907791,
            con domicilio en Cal. Los Recuerdos 387, Urb. Chacarilla del Estanque, San Borja, Lima, Perú,
            respeta su privacidad y se compromete a protegerla conforme a esta política y a la Ley N° 29733
            — Ley de Protección de Datos Personales del Perú y su reglamento (D.S. N° 003-2013-JUS).
          </p>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-bitel-blue mb-2">Información que Recopilamos</h2>
            <p className="text-sm text-gray-700 mb-2">
              Recopilamos la siguiente información cuando utiliza nuestra plataforma:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
              <li>Número de teléfono celular del destinatario de la recarga.</li>
              <li>En caso de registro: nombre completo, correo electrónico, foto de perfil y número de teléfono del usuario.</li>
              <li>Datos de la transacción: monto, operador, fecha, hora y referencia de pago.</li>
              <li>Información de navegación: dirección IP, tipo de navegador y páginas visitadas.</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              No recopilamos ni almacenamos datos de tarjetas de crédito o débito. El procesamiento de pagos
              es realizado directamente por pasarelas de pago certificadas.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-bitel-blue mb-2">Uso de la Información</h2>
            <p className="text-sm text-gray-700 mb-2">Utilizamos la información recopilada para:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
              <li>Procesar y confirmar las recargas solicitadas.</li>
              <li>Generar el recibo digital de la transacción, disponible para descarga por el usuario.</li>
              <li>Gestionar la cuenta del usuario registrado.</li>
              <li>Atender consultas, reclamos y solicitudes de reembolso.</li>
              <li>Cumplir con obligaciones legales y regulatorias aplicables.</li>
              <li>Mejorar la experiencia de uso de la plataforma.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-bitel-blue mb-2">Compartir Información con Terceros</h2>
            <p className="text-sm text-gray-700 mb-2">
              No vendemos ni cedemos su información personal a terceros para fines de marketing.
              Compartimos únicamente la información estrictamente necesaria con:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
              <li>Operadores de telecomunicaciones, para procesar la recarga al número de destino.</li>
              <li>Pasarelas de pago certificadas, para el procesamiento seguro de la transacción.</li>
              <li>Autoridades competentes, cuando sea requerido por ley.</li>
            </ul>
          </div>

          <Section title="Seguridad de la Información">
            Hemos implementado medidas técnicas y organizativas para proteger su información personal
            contra accesos no autorizados, pérdida, alteración o divulgación indebida.
          </Section>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-bitel-blue mb-2">Derechos del Usuario</h2>
            <p className="text-sm text-gray-700 mb-2">
              Conforme a la Ley N° 29733, usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
              <li>Acceder a sus datos personales que obren en nuestros registros.</li>
              <li>Rectificar datos inexactos o incompletos.</li>
              <li>Solicitar la cancelación o supresión de sus datos.</li>
              <li>Oponerse al tratamiento de sus datos en los casos previstos por ley.</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              Para ejercer cualquiera de estos derechos, puede contactarnos en{' '}
              <a href="mailto:canales.digitales@latcom.co" className="text-bitel-blue hover:underline">
                canales.digitales@latcom.co
              </a>.
              Responderemos su solicitud en un plazo máximo de 20 días hábiles.
            </p>
          </div>

          <Section title="Modificaciones">
            Nos reservamos el derecho de actualizar esta política en cualquier momento. La versión vigente
            estará siempre disponible en este sitio web con la fecha de última actualización.
          </Section>

          <Section title="Contacto">
            Para consultas relacionadas con el tratamiento de sus datos personales:{' '}
            <a href="mailto:canales.digitales@latcom.co" className="text-bitel-blue hover:underline">
              canales.digitales@latcom.co
            </a>
          </Section>

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-base font-semibold text-bitel-blue mb-2">{title}</h2>
    <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
  </div>
);

export default PrivacidadView;
