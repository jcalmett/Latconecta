import { useState, useEffect } from 'react';
import { Mail, MapPin, Globe } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import LoginForm from '../components/auth/LoginForm';

const WelcomeView = ({ latconectaData }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fotos de marketing de Latconecta
  const marketingPhotos = [
    latconectaData?.latconecta_photo_mkt1,
    latconectaData?.latconecta_photo_mkt2,
    latconectaData?.latconecta_photo_mkt3,
    latconectaData?.latconecta_photo_mkt4
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

  // HEADER - Logo de Latconecta
  const Header = () => (
    <div className="bg-[#FFE709] shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
              alt="Logo Latconecta"
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

  // FOOTER - Logo + Lema 1 + Contactos + Descripción
  const Footer = () => (
    <div className="bg-[#FFE709] text-gray-900 py-6 mt-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* COLUMNA 1: Logo + Lema 1 */}
          <div>
            <img
              src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
              alt="Logo Latconecta"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-12 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-800 font-medium">
              {latconectaData?.latconecta_lema_1 || 'Conectando el futuro'}
            </p>
          </div>

          {/* COLUMNA 2: Contacto */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Contacto</h4>
            <div className="space-y-2 text-sm">
              {latconectaData?.latconecta_mail_comercial && (
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{latconectaData.latconecta_mail_comercial}</span>
                </div>
              )}
              {latconectaData?.latconecta_mail_support && (
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{latconectaData.latconecta_mail_support}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Miami, FL, USA</span>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: Historia */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Historia</h4>
            <p className="text-sm text-gray-800">
              {latconectaData?.latconecta_description || 'Plataforma de servicios digitales innovadora'}
            </p>
          </div>

          {/* COLUMNA 4: Enlaces */}
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
          © 2025 {latconectaData?.latconecta_name || 'Latconecta'}. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {/* SECCIÓN 1: LOGO - 30vh */}
        <div className="flex items-center justify-center" style={{ height: '30vh' }}>
          <div className="w-full max-w-md px-4">
            <img
              src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
              alt="Latconecta Logo"
              onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '25vh' }}
            />
          </div>
        </div>

        {/* ESPACIO REDUCIDO */}
        <div className="-mt-12"></div>

        {/* SECCIÓN 2: LEMA 1 - 20vh */}
        <div className="flex items-center justify-center" style={{ height: '20vh' }}>
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-[#008C96]">
              {latconectaData?.latconecta_lema_1 || 'Conectando el futuro'}
            </h1>
          </div>
        </div>

        {/* ESPACIO REDUCIDO */}
        <div className="-mt-10"></div>

        {/* SECCIÓN 3: CARRUSEL DE FOTOS - 30vh */}
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
                      src={getImageUrl(photo, 'companies')}
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

        {/* ESPACIO REDUCIDO */}
        <div className="-mt-10"></div>

        {/* SECCIÓN 4: LEMA 2 - 20vh */}
        <div className="flex items-center justify-center" style={{ height: '20vh' }}>
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-700">
              {latconectaData?.latconecta_lema_2 || 'Innovación sin fronteras'}
            </h2>
          </div>
        </div>
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