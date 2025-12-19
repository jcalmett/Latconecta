import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

const Header = ({ user, onLogout, companyData, onOpenLogin, onOpenSignUp }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="bg-bitel-yellow shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={getImageUrl(companyData?.company_logo, 'company')}
              alt="Bitel Logo"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/shop"
              className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Shop
            </Link>

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
              <Link
                to="/shop"
                className="bg-bitel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>

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