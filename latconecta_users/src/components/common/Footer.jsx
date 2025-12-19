import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

const Footer = ({ companyData }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bitel-yellow mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Logo + Información de la empresa */}
          <div>
            <div className="mb-4">
              <img
                src={getImageUrl(companyData?.company_logo, 'company')}
                alt="Bitel Logo"
                onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              {companyData?.company_description5 || 'Plataforma de Servicios Digitales - Telefonía móvil para todos'}
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bitel-blue">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@bitel.com.pe</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                <span>+51 999 999 999</span>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* Columna 3: Historia */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bitel-blue">Historia</h3>
            <p className="text-gray-700 text-sm">
              Bitel es líder en servicios de telecomunicaciones en el Perú.
            </p>
          </div>

          {/* Columna 4: Enlaces */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-bitel-blue">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-bitel-blue transition-colors text-sm"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-700 hover:text-bitel-blue transition-colors text-sm"
                >
                  Términos
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador y Copyright */}
        <div className="border-t border-yellow-600 mt-8 pt-6">
          <div className="text-center">
            <p className="text-gray-700 text-sm">
              © {currentYear} Bitel. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;