import { Link } from 'react-router-dom';

const AvisoLegalView = () => {
  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-10">

          <h1 className="text-2xl font-bold text-bitel-blue mb-1">Aviso Legal</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: 19 de junio de 2026</p>

          <p className="text-sm text-gray-700 mb-6">
            Este sitio web es proporcionado por LATCOM HORIZONS PERU S.R.L., con nombre comercial <strong>Latconecta</strong>,
            con domicilio fiscal en Cal. Los Recuerdos 387, Urb. Chacarilla del Estanque, San Borja, Lima, Perú,
            RUC 20612907791 ("Latconecta", "nosotros", "nuestro"). El siguiente aviso legal aplica a nuestro
            sitio web peruse.latconecta.com.
          </p>

          <Section title="Uso del Sitio Web">
            Al acceder y utilizar este sitio web, usted acepta y se compromete a cumplir los términos y condiciones
            contenidos en este aviso. Si no acepta estos términos, no debe utilizar este sitio web.
          </Section>

          <Section title="Derechos de Propiedad Intelectual">
            Todos los contenidos de este sitio web, incluyendo textos, imágenes, logotipos y diseño, son propiedad
            de LATCOM HORIZONS PERU S.R.L. o de sus respectivos titulares, y están protegidos por las leyes de
            propiedad intelectual aplicables. Todos los derechos están reservados.
          </Section>

          <Section title="Licencia de Uso">
            Usted puede visualizar, descargar para almacenamiento en caché e imprimir páginas de este sitio para
            uso personal, sujeto a las restricciones indicadas en este aviso y en los Términos y Condiciones.
          </Section>

          <Section title="Limitación de Responsabilidad">
            Latconecta no será responsable por daños o perjuicios derivados del uso o imposibilidad de uso de
            este sitio web, ni por interrupciones, errores técnicos o contenido de terceros enlazado desde
            nuestra plataforma.
          </Section>

          <Section title="Modificaciones">
            Nos reservamos el derecho de modificar este aviso legal en cualquier momento. La versión actualizada
            estará disponible en este sitio web con la fecha de última actualización. El uso continuado del sitio
            implica la aceptación de dichas modificaciones.
          </Section>

          <Section title="Acuerdo Completo">
            Este aviso legal, junto con nuestra{' '}
            <Link to="/privacidad" className="text-bitel-blue hover:underline">Política de Privacidad</Link>
            {' '}y{' '}
            <Link to="/terminos" className="text-bitel-blue hover:underline">Términos y Condiciones</Link>,
            constituye el acuerdo completo entre usted y Latconecta respecto al uso de este sitio web.
          </Section>

          <Section title="Ley Aplicable y Jurisdicción">
            Este aviso se rige por las leyes de la República del Perú. Cualquier controversia derivada de su
            uso será sometida a la jurisdicción de los juzgados y tribunales de la ciudad de Lima.
          </Section>

          <Section title="Contacto">
            Para consultas relacionadas con este aviso legal:{' '}
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

export default AvisoLegalView;
