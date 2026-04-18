"""
Servicio de Email — LatConecta
Envío de código de recuperación de contraseña vía Gmail SMTP
"""
import random
import string
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings


def generate_reset_code() -> str:
    """Genera un código numérico aleatorio de 6 dígitos"""
    return ''.join(random.choices(string.digits, k=6))


async def send_reset_code(to_email: str, user_name: str, code: str) -> bool:
    """
    Envía el código de recuperación de contraseña al email del usuario.

    Args:
        to_email:   Email destino del usuario
        user_name:  Nombre del usuario para personalizar el mensaje
        code:       Código de 6 dígitos a enviar

    Returns:
        True si el envío fue exitoso, lanza excepción si falla
    """

    html_body = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="500" cellpadding="0" cellspacing="0"
                           style="background-color:#ffffff; border-radius:8px;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#0d7a6b; padding: 32px; text-align:center;">
                                <h1 style="color:#f5c518; margin:0; font-size:28px;
                                           font-weight:bold; letter-spacing:1px;">
                                    LatConecta
                                </h1>
                                <p style="color:#ffffff; margin:6px 0 0 0; font-size:13px;">
                                    Conectando América Latina
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 36px 40px;">
                                <p style="color:#333333; font-size:16px; margin:0 0 16px 0;">
                                    Hola <strong>{user_name}</strong>,
                                </p>
                                <p style="color:#555555; font-size:15px; margin:0 0 24px 0;">
                                    Recibimos una solicitud para restablecer la contraseña
                                    de tu cuenta. Usa el siguiente código:
                                </p>

                                <!-- Código -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 24px 0;">
                                            <div style="display:inline-block;
                                                        background-color:#f0faf8;
                                                        border: 2px solid #0d7a6b;
                                                        border-radius:8px;
                                                        padding: 20px 48px;">
                                                <span style="font-size:42px; font-weight:bold;
                                                             color:#0d7a6b; letter-spacing:12px;">
                                                    {code}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <p style="color:#555555; font-size:14px; margin:0 0 8px 0;
                                          text-align:center;">
                                    Este código es válido por <strong>15 minutos</strong>.
                                </p>
                                <p style="color:#888888; font-size:13px; margin:24px 0 0 0;">
                                    Si no solicitaste restablecer tu contraseña, puedes ignorar
                                    este mensaje. Tu contraseña no cambiará.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f9f9f9; padding: 20px 40px;
                                       border-top: 1px solid #eeeeee; text-align:center;">
                                <p style="color:#aaaaaa; font-size:12px; margin:0;">
                                    © 2026 LatConecta — LATCOM Horizons II, LLC
                                </p>
                                <p style="color:#aaaaaa; font-size:12px; margin:4px 0 0 0;">
                                    Este es un mensaje automático, por favor no respondas.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    # Construir mensaje
    message = MIMEMultipart("alternative")
    message["Subject"] = "Tu código de recuperación — LatConecta"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = to_email
    message.attach(MIMEText(html_body, "html"))

    # Enviar vía Gmail SMTP con STARTTLS
    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )

    return True
