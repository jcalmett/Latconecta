import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, FALLBACK_IMAGES } from "../utils/imageHelper";

const WelcomeView = ({ latconectaData }) => {
  const navigate = useNavigate();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fotos de marketing de Latconecta
  const marketingPhotos = [
    latconectaData?.latconecta_photo_mkt1,
    latconectaData?.latconecta_photo_mkt2,
    latconectaData?.latconecta_photo_mkt3,
    latconectaData?.latconecta_photo_mkt4
  ].filter(Boolean); // Filtrar nulos/undefined

  // Carrusel automático - cambio cada 3 segundos
  useEffect(() => {
    if (marketingPhotos.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % marketingPhotos.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [marketingPhotos.length]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* SECCIÓN 1: LOGO (30% altura) */}
      <div className="flex items-center justify-center" style={{ height: '30vh' }}>
        <div className="w-full max-w-md px-4">
          <img
            src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
            alt="Latconecta Logo"
            onError={(e) => e.target.src = FALLBACK_IMAGES.company}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '25vh' }}
          />
        </div>
      </div>

      {/* ESPACIO REDUCIDO - Distancia entre Logo y Lema 1 */}
      <div className="-mt-12"></div>

      {/* SECCIÓN 2: SLOGAN 1 (20% altura) */}
      <div className="flex items-center justify-center" style={{ height: '20vh' }}>
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-bitel-blue">
            {latconectaData?.latconecta_lema_1 || 'Conectando el futuro'}
          </h1>
        </div>
      </div>

      {/* ESPACIO REDUCIDO - Distancia entre Lema 1 y Carrusel */}
      <div className="-mt-10"></div>

      {/* SECCIÓN 3: CARRUSEL DE FOTOS (30% altura) */}
      <div className="flex items-center justify-center" style={{ height: '30vh' }}>
        <div className="relative w-full max-w-4xl px-4 h-full flex items-center">
          {/* Contenedor del carrusel */}
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
                    onError={(e) => e.target.src = FALLBACK_IMAGES.general}
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

          {/* Indicadores de posición */}
          {marketingPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {marketingPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentPhotoIndex
                      ? 'bg-bitel-yellow scale-125'
                      : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Ver foto ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ESPACIO REDUCIDO - Distancia entre Carrusel y Lema 2 */}
      <div className="-mt-4"></div>

      {/* SECCIÓN 4: SLOGAN 2 + BOTÓN (20% altura) */}
      <div className="flex items-center justify-center" style={{ height: '20vh' }}>
        <div className="text-center px-4 space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-700">
            {latconectaData?.latconecta_lema_2 || 'Innovación sin fronteras'}
          </h2>
          <button
            onClick={() => navigate('/select')}
            className="bg-bitel-yellow text-bitel-blue px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Comenzar a Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;