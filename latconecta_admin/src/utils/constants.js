// Colores corporativos Bitel
export const COLORS = {
  YELLOW: "#FFC600",
  BLUE: "#008C96",
  CYAN: "#00A0E3",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  GRAY: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

// Estados de compra
export const PURCHASE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Labels de estados de compra
export const PURCHASE_STATUS_LABELS = {
  pending: "Pendiente",
  completed: "Completada",
  failed: "Fallida",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
};

// Colores de estados
export const STATUS_COLORS = {
  active: "green",
  inactive: "gray",
  pending: "yellow",
  completed: "green",
  failed: "red",
  cancelled: "gray",
  refunded: "blue",
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Labels de roles
export const USER_ROLE_LABELS = {
  admin: "Administrador",
  user: "Usuario",
};

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Monedas soportadas
export const CURRENCIES = {
  USD: "USD",
  PEN: "PEN",
};

// Símbolos de moneda
export const CURRENCY_SYMBOLS = {
  USD: "$",
  PEN: "S/",
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  USERS: "/users",
  LOGIN: "/login",
  PROFILE: "/profile",
  NOT_FOUND: "*",
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Error de conexión. Por favor, verifica tu conexión a internet.",
  AUTH_ERROR: "No estás autenticado. Por favor, inicia sesión.",
  PERMISSION_ERROR: "No tienes permisos para realizar esta acción.",
  NOT_FOUND: "El recurso solicitado no fue encontrado.",
  SERVER_ERROR: "Error en el servidor. Por favor, intenta más tarde.",
  VALIDATION_ERROR: "Por favor, verifica los datos ingresados.",
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Formatos de fecha
export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "DD [de] MMMM [de] YYYY",
  WITH_TIME: "DD/MM/YYYY HH:mm",
  TIME_ONLY: "HH:mm",
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: "Bitel",
  TAGLINE: "Telefonía móvil para todos",
  VERSION: "1.0.0",
  API_TIMEOUT: 30000,
};

export default {
  COLORS,
  PURCHASE_STATUS,
  PURCHASE_STATUS_LABELS,
  STATUS_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  ROUTES,
  ERROR_MESSAGES,
  PAGINATION,
  DATE_FORMATS,
  APP_CONFIG,
};
