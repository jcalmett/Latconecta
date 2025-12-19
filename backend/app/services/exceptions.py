"""
Excepciones customizadas para servicios de vendors
"""


class VendorError(Exception):
    """Excepción base para errores de vendors"""
    pass


class VendorAPIError(VendorError):
    """Error en API del vendor (respuesta con error)"""
    
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(self.message)


class VendorTimeoutError(VendorError):
    """Timeout esperando respuesta del vendor"""
    
    def __init__(self, message: str = "Vendor no respondió en tiempo límite"):
        self.message = message
        super().__init__(self.message)


class VendorConnectionError(VendorError):
    """Error de conexión con vendor"""
    
    def __init__(self, message: str = "No se pudo conectar con vendor"):
        self.message = message
        super().__init__(self.message)


class VendorAuthenticationError(VendorError):
    """Error de autenticación con vendor"""
    
    def __init__(self, message: str = "Error autenticando con vendor"):
        self.message = message
        super().__init__(self.message)
