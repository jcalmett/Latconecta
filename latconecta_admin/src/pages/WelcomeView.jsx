import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import LoginForm from '../components/auth/LoginForm';

const WelcomeView = ({ companyData }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fotos de marketing
  const marketingPhotos = [
    companyData?.company_photo_mkt1,
    companyData?.company_photo_mkt2,
    companyData?.company_photo_mkt3,
    companyData?.company_photo_mkt4
  ].filter(Boolean);

  // Carrusel automático - cambio cada 3 segundos
  useEffect(() => {
    if (marketingPhotos.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % marketingPhotos.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [marketingPhotos.length]);

  // ✅ HEADER - Logo grande (h-20) + "Panel Administración"
  const Header = () => (
    <div className="bg-[#FFE709] shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src={getImageUrl(companyData?.company_logo, 'company')}
              alt="Logo Bitel"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-20 w-auto object-contain"
            />
            <span className="text-lg font-semibold text-gray-700">Panel Administración</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 bg-[#008C96] text-white rounded-lg hover:bg-[#007580] transition-all font-semibold shadow-md"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ FOOTER - Logo pequeño (h-12)
  const Footer = () => (
    <div className="bg-[#FFE709] text-gray-900 py-6 mt-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src={getImageUrl(companyData?.company_logo, 'company')}
              alt="Logo Bitel"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-12 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-800">
              Plataforma de Servicios Digitales - Telefonía móvil para todos
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Contacto</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@bitel.com.pe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+51 999 999 999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Historia</h4>
            <p className="text-sm text-gray-800">
              Bitel es líder en servicios de telecomunicaciones en el Perú.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Enlaces</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 hover:text-[#008C96] cursor-pointer">
                <Globe size={16} />
                <span>Sobre Nosotros</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-[#008C96] cursor-pointer">
                <Globe size={16} />
                <span>Términos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-6 pt-4 text-center text-sm text-gray-700">
          © 2025 Bitel. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ✅ CONTENIDO - TAMAÑOS ORIGINALES + ESPACIOS REDUCIDOS 50% */}
      <div className="flex-1 flex flex-col">
        
        {/* SECCIÓN 1: LOGO - 30vh (sin cambios) */}
        <div className="flex items-center justify-center" style={{ height: '30vh' }}>
          <div className="w-full max-w-md px-4">
            <img
              src={getImageUrl(companyData?.company_logo, 'company')}
              alt="Bitel Logo"
              onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '25vh' }}
            />
          </div>
        </div>

        {/* ✅ ESPACIO REDUCIDO 50% - Logo → Slogan 1 */}
        <div className="-mt-12"></div>

        {/* SECCIÓN 2: SLOGAN 1 - 20vh (sin cambios) */}
        <div className="flex items-center justify-center" style={{ height: '20vh' }}>
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-[#008C96]">
              {companyData?.company_lema_1 || 'Telefonía móvil para todos'}
            </h1>
          </div>
        </div>

        {/* ✅ ESPACIO REDUCIDO 50% - Slogan 1 → Fotos */}
        <div className="-mt-10"></div>

        {/* SECCIÓN 3: CARRUSEL DE FOTOS - 30vh (sin cambios) */}
        <div className="flex items-center justify-center" style={{ height: '30vh' }}>
          <div className="relative w-full max-w-4xl px-4 h-full flex items-center">
            <div className="relative w-full h-full max-h-80 overflow-hidden rounded-lg shadow-lg">
              {marketingPhotos.length > 0 ? (
                marketingPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentPhotoIndex
                        ? 'opacity-100 translate-x-0'
                        : index < currentPhotoIndex
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <img
                      src={getImageUrl(photo, 'company')}
                      alt={`Marketing ${index + 1}`}
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.general)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No hay fotos de marketing disponibles</p>
                </div>
              )}
            </div>

            {marketingPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {marketingPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPhotoIndex
                        ? 'bg-[#FFE709] scale-125'
                        : 'bg-white bg-opacity-50'
                    }`}
                    aria-label={`Ver foto ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ ESPACIO REDUCIDO 50% - Fotos → Slogan 2 */}
        <div className="-mt-10"></div>

        {/* SECCIÓN 4: SLOGAN 2 - 20vh (sin cambios) */}
        <div className="flex items-center justify-center" style={{ height: '20vh' }}>
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-700">
              {companyData?.company_lema_2 || 'La mejor red del Perú'}
            </h2>
          </div>
        </div>

        {/* ✅ ESPACIO REDUCIDO 50% - Slogan 2 → Footer */}
        {/* Se controla con mt-6 en Footer (reducido de mt-12) */}
      </div>

      <Footer />

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <LoginForm onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeView;