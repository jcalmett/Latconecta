import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, FALLBACK_IMAGES } from "../utils/imageHelper";

const WelcomeView = ({ latconectaData }) => {
  const navigate = useNavigate();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const marketingPhotos = [
    latconectaData?.latconecta_photo_mkt1,
    latconectaData?.latconecta_photo_mkt2,
    latconectaData?.latconecta_photo_mkt3,
    latconectaData?.latconecta_photo_mkt4
  ].filter(Boolean);

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

      {/* SECCIÓN 1: LOGO */}
      <div className="flex items-center justify-center py-4 lg:py-7">
        <div className="w-full max-w-xs lg:max-w-md px-4">
          <img
            src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
            alt="Latconecta Logo"
            onError={(e) => e.target.src = FALLBACK_IMAGES.company}
            className="w-full h-auto object-contain max-h-24 lg:max-h-32"
          />
        </div>
      </div>

      {/* SECCIÓN 2: SLOGAN 1 */}
      <div className="flex items-center justify-center py-2 lg:py-3">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-bitel-blue">
            {latconectaData?.latconecta_lema_1 || 'Conectando el futuro'}
          </h1>
        </div>
      </div>

      {/* SECCIÓN 3: CARRUSEL */}
      <div className="flex items-center justify-center py-2 lg:py-3">
        <div className="relative w-full max-w-4xl px-4">
          <div className="relative w-full overflow-hidden rounded-lg shadow-lg" style={{ height: '200px' }}>
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
          {marketingPhotos.length > 1 && (
            <div className="flex justify-center mt-2 space-x-2">
              {marketingPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentPhotoIndex
                      ? 'bg-bitel-yellow scale-125'
                      : 'bg-gray-400 bg-opacity-50'
                  }`}
                  aria-label={`Ver foto ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 4: SLOGAN 2 + BOTÓN */}
      <div className="flex items-center justify-center py-2 lg:py-4">
        <div className="text-center px-4 space-y-4">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-gray-700">
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
