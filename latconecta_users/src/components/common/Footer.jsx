import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

// Imagen del Libro de Reclamaciones (Art. 4-B + Art. 9 DS 006-2014)
const LIBRO_IMG = 'data:image/png;base64,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';

const Footer = ({ latconectaData }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bitel-yellow mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: Logo + Lema */}
          <div>
            <div className="mb-3">
              <img
                src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
                alt="Latconecta Logo"
                onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-700 mb-2 text-sm">
              {latconectaData?.latconecta_lema_1 || 'Plataforma de Servicios Digitales'}
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-bitel-blue">Contacto</h3>
            <div className="space-y-1">
              <div className="flex items-center text-gray-700 text-sm">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{latconectaData?.latconecta_mail_comercial || 'comercial@latconecta.com'}</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{latconectaData?.latconecta_mail_support || 'support@latconecta.com'}</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Calle Los Recuerdos 387, Urb. Chacarilla del Estanque, San Borja, Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* Columna 3: Enlaces + Libro de Reclamaciones en la misma fila */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-bitel-blue">Legal</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <Link to="/terminos" className="text-gray-700 hover:text-bitel-blue transition-colors text-sm">
                  Términos y Condiciones
                </Link>
                <Link to="/privacidad" className="text-gray-700 hover:text-bitel-blue transition-colors text-sm">
                  Privacidad
                </Link>
                <Link to="/aviso-legal" className="text-gray-700 hover:text-bitel-blue transition-colors text-sm">
                  Aviso Legal
                </Link>
              </div>
              {/* LIBRO DE RECLAMACIONES — Art. 4-B + Art. 9 DS 006-2014 */}
              <Link to="/reclamaciones" title="Libro de Reclamaciones Virtual">
                <img
                  src={LIBRO_IMG}
                  alt="Libro de Reclamaciones Virtual"
                  className="h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Separador y Copyright */}
        <div className="border-t border-yellow-600 mt-4 pt-3">
          <div className="text-center">
            <p className="text-gray-700 text-sm">
              © {currentYear} LATCOM HORIZONS PERU S.R.L. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
