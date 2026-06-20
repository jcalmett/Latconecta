import { Link } from 'react-router-dom';

const TerminosView = () => {
  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-10">

          <h1 className="text-2xl font-bold text-bitel-blue mb-1">Términos y Condiciones</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: 19 de junio de 2026</p>

          <Section title="Información General">
            El presente documento establece los Términos y Condiciones que rigen el uso de la plataforma
            Latconecta, operada por LATCOM HORIZONS PERU S.R.L., RUC 20612907791, con domicilio en
            Cal. Los Recuerdos 387, Urb. Chacarilla del Estanque, San Borja, Lima, Perú.
          </Section>

          <Section title="Aceptación">
            El acceso y uso de este sitio web implica la aceptación plena de estos Términos y Condiciones.
            Latconecta se reserva el derecho de actualizarlos en cualquier momento, notificando a los
            usuarios a través del sitio web.
          </Section>

          <Section title="Productos y Servicios">
            <span>
              Latconecta es una plataforma de servicios digitales de telecomunicaciones que permite a sus
              usuarios realizar recargas de saldo prepago (TopUps) a teléfonos celulares.
            </span>
            <br /><br />
            <span>
              Una recarga de saldo prepago es, conforme a la Norma de Condiciones de Uso de los Servicios
              Públicos de Telecomunicaciones (Resolución de Consejo Directivo N° 172-2022-CD/OSIPTEL), un
              crédito de comunicaciones: un valor intangible en soles acreditado directamente en la línea
              móvil del destinatario. El saldo se valoriza según la Tarifa Única Prepago que cada operador
              tiene registrada ante OSIPTEL.
            </span>
            <br /><br />
            <span>
              Lo que el operador entrega al abonado por dicho saldo — incluyendo bonos o paquetes de
              beneficios — es determinado y publicado por el propio operador en OSIPTEL y en su portal
              oficial, conforme a las condiciones del contrato de abonado de cada operador, fuera del
              control de Latconecta. El usuario puede consultar los beneficios aplicables directamente
              en el portal de su operador o en{' '}
              <a href="https://www.osiptel.gob.pe" target="_blank" rel="noopener noreferrer"
                className="text-bitel-blue hover:underline">
                osiptel.gob.pe
              </a>.
            </span>
            <br /><br />
            <span>
              La disponibilidad de los servicios puede estar sujeta a cambios sin previo aviso, dependiendo
              de la cobertura y condiciones de cada operador de telecomunicaciones.
            </span>
          </Section>

          <Section title="Registro y Uso">
            Los usuarios pueden realizar compras sin necesidad de crear una cuenta. En caso de registrarse,
            el usuario deberá proporcionar información veraz y actualizada. Es responsabilidad del usuario
            verificar que el número de teléfono destinatario sea correcto antes de confirmar la compra.
          </Section>

          <Section title="Restricciones de Uso">
            Queda prohibido el uso de la plataforma para actividades ilegales, fraudulentas o que puedan
            causar daño a terceros o a la red de telecomunicaciones. Latconecta se reserva el derecho de
            suspender el acceso ante cualquier uso indebido.
          </Section>

          <Section title="Precios y Pagos">
            Los precios se expresan en Soles Peruanos (PEN) e incluyen los impuestos aplicables conforme
            a la legislación peruana vigente. Los métodos de pago aceptados son tarjeta de crédito o débito
            y Yape. El procesamiento de pagos se realiza de forma segura a través de pasarelas de pago
            certificadas. Latconecta no almacena datos de tarjetas de pago.
          </Section>

          <div className="mb-6">
            <h2 className="text-base font-semibold text-bitel-blue mb-2">Proceso de Compra</h2>
            <ol className="list-decimal list-inside text-sm text-gray-700 leading-relaxed space-y-1 ml-2">
              <li>El usuario selecciona el operador y el monto de recarga.</li>
              <li>Ingresa el número de teléfono celular del destinatario.</li>
              <li>Selecciona el método de pago y completa la transacción.</li>
              <li>Una vez confirmado el pago, la recarga se acredita directamente al número indicado.</li>
              <li>
                El sistema genera y entrega al usuario un recibo digital con los datos de la transacción:
                fecha, hora, referencia, operador, número de destino y monto.
              </li>
            </ol>
          </div>

          <Section title="Entrega del Servicio">
            Al tratarse de un servicio digital, la recarga se procesa de forma inmediata tras la
            confirmación del pago. El tiempo efectivo de acreditación depende del operador de
            telecomunicaciones del destinatario.
          </Section>

          <Section title="Política de Reembolsos">
            <span>
              Dado que las recargas de saldo prepago son servicios digitales acreditados de forma inmediata
              e irreversible al número de destino, todas las ventas son finales. Sin embargo, en caso de
              que la recarga no pudiera realizarse por razones técnicas imputables a la plataforma,
              Latconecta efectuará la devolución del importe cobrado de forma automática.
            </span>
            <br /><br />
            <span>
              Solo en el improbable caso de que la devolución automática no se concrete, el usuario podrá
              solicitar el reembolso dirigiéndose a{' '}
              <a href="mailto:canales.digitales@latcom.co" className="text-bitel-blue hover:underline">
                canales.digitales@latcom.co
              </a>
              , adjuntando el recibo digital generado por el sistema al momento de la transacción, el cual
              contiene la fecha, hora, referencia, operador, número de destino y monto del cobro. El plazo
              de respuesta es de hasta 30 días calendario.
            </span>
            <br /><br />
            <span>
              No proceden reembolsos cuando la recarga haya sido acreditada exitosamente al número de
              destino indicado por el usuario, ni cuando el número ingresado sea incorrecto por error
              del usuario.
            </span>
          </Section>

          <Section title="Protección de Datos Personales">
            El tratamiento de los datos personales de los usuarios se rige por la Ley N° 29733 — Ley de
            Protección de Datos Personales del Perú y su reglamento. Para mayor detalle, consulte nuestra{' '}
            <Link to="/privacidad" className="text-bitel-blue hover:underline">
              Política de Privacidad
            </Link>.
          </Section>

          <Section title="Propiedad Intelectual">
            Todo el contenido de la plataforma, incluyendo logotipos, imágenes y textos, es propiedad de
            LATCOM HORIZONS PERU S.R.L. y está protegido por las leyes de propiedad intelectual aplicables.
          </Section>

          <Section title="Responsabilidad y Limitaciones">
            Latconecta no se responsabiliza por fallas técnicas ajenas a su control, incluyendo
            interrupciones en las redes de los operadores de telecomunicaciones. El usuario es responsable
            de verificar la información ingresada antes de confirmar cada transacción.
          </Section>

          <Section title="Legislación Aplicable y Resolución de Conflictos">
            Estos Términos y Condiciones se rigen por la legislación peruana. Las controversias serán
            resueltas conforme a los mecanismos establecidos por INDECOPI o las instancias judiciales
            competentes de la ciudad de Lima.
          </Section>

          <Section title="Libro de Reclamaciones">
            Conforme a la Ley N° 29571 — Código de Protección y Defensa del Consumidor, Latconecta pone
            a disposición de sus usuarios un{' '}
            <Link to="/reclamaciones" className="text-bitel-blue hover:underline">
              Libro de Reclamaciones Virtual
            </Link>{' '}
            accesible desde el sitio web.
          </Section>

          <Section title="Contacto">
            Para consultas o reclamos:{' '}
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

export default TerminosView;
