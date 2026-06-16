import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

const Header = ({ user, onLogout, latconectaData, onOpenLogin, onOpenSignUp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determinar si estamos en la sección Shop (incluye /select y /shop)
  const isShopActive = location.pathname === '/select' || location.pathname === '/shop';

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    }
    setMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    if (onOpenSignUp) {
      onOpenSignUp();
    }
    setMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    navigate('/select');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-bitel-yellow shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={getImageUrl(latconectaData?.latconecta_logo, 'companies')}
              alt="Latconecta Logo"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-14 lg:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleShopClick}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isShopActive
                  ? 'bg-bitel-blue text-white'
                  : 'bg-transparent text-bitel-blue hover:bg-bitel-blue hover:text-white'
              }`}
            >
              Shop
            </button>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Mi Cuenta
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignUpClick}
                  className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleLoginClick}
                  className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Login
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-bitel-blue"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-600">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={handleShopClick}
                className={`px-4 py-2 rounded-lg font-semibold text-center transition-colors ${
                  isShopActive
                    ? 'bg-bitel-blue text-white'
                    : 'bg-transparent text-bitel-blue hover:bg-bitel-blue hover:text-white'
                }`}
              >
                Shop
              </button>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Cuenta
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignUpClick}
                    className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Login
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;