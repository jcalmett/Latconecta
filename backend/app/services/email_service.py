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


async def send_verification_code(to_email: str, user_name: str, code: str) -> bool:
    """
    Envía el código OTP de verificación de email para el registro de usuario.
    
    Args:
        to_email:   Email destino del usuario
        user_name:  Nombre del usuario para personalizar el mensaje
        code:       Código OTP de 6 dígitos
    """
    html_body = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 40px 0;">
            <tr><td align="center">
                <table width="500" cellpadding="0" cellspacing="0"
                       style="background-color:#ffffff; border-radius:8px;
                              box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
                    <!-- Header -->
                    <tr><td style="background-color:#0d7a6b; padding: 32px; text-align:center;">
                        <h1 style="color:#f5c518; margin:0; font-size:28px; font-weight:bold; letter-spacing:1px;">
                            LatConecta
                        </h1>
                        <p style="color:#ffffff; margin:6px 0 0 0; font-size:13px;">Conectando América Latina</p>
                    </td></tr>
                    <!-- Body -->
                    <tr><td style="padding: 36px 40px;">
                        <p style="color:#333333; font-size:16px; margin:0 0 16px 0;">
                            Hola <strong>{user_name}</strong>,
                        </p>
                        <p style="color:#555555; font-size:15px; margin:0 0 24px 0;">
                            Para completar tu registro en LatConecta, ingresa el siguiente
                            código de verificación:
                        </p>
                        <!-- Código -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr><td align="center" style="padding: 24px 0;">
                                <div style="display:inline-block; background-color:#f0faf8;
                                            border: 2px solid #0d7a6b; border-radius:8px;
                                            padding: 20px 48px;">
                                    <span style="font-size:42px; font-weight:bold;
                                                 color:#0d7a6b; letter-spacing:12px;">
                                        {code}
                                    </span>
                                </div>
                            </td></tr>
                        </table>
                        <p style="color:#555555; font-size:14px; margin:0 0 8px 0; text-align:center;">
                            Este código es válido por <strong>15 minutos</strong>.
                        </p>
                        <p style="color:#888888; font-size:13px; margin:24px 0 0 0;">
                            Si no solicitaste crear una cuenta en LatConecta, puedes ignorar
                            este mensaje.
                        </p>
                    </td></tr>
                    <!-- Footer -->
                    <tr><td style="background-color:#f9f9f9; padding: 20px 40px;
                                   border-top: 1px solid #eeeeee; text-align:center;">
                        <p style="color:#aaaaaa; font-size:12px; margin:0;">
                            © 2026 LatConecta — LATCOM Horizons II, LLC
                        </p>
                        <p style="color:#aaaaaa; font-size:12px; margin:4px 0 0 0;">
                            Este es un mensaje automático, por favor no respondas.
                        </p>
                    </td></tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verifica tu email — LatConecta"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = to_email
    message.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )
    return True


# ═══════════════════════════════════════════════════════════════════════════
# FUNCIONES LR-001 — LIBRO DE RECLAMACIONES VIRTUAL
# ═══════════════════════════════════════════════════════════════════════════

LEYENDA_ART13 = (
    "La formulación del reclamo no impide acudir a otras vías de solución de controversias "
    "ni es requisito previo para interponer una denuncia ante el INDECOPI."
)


async def send_complaint_ack(
    to_email: str, nombre: str, numero: str, fecha,
    tipo: str, fecha_lim, canal: str,
    bien_desc: str = "", bien_monto: float = 0,
    detalle: str = "", pedido: str = "",
) -> bool:
    """
    Acuse de recibo con detalle completo — Art. 4-B DS 006-2014 — P-1.
    SIEMPRE a to_email (consumidor_email del formulario). NUNCA al email de sesión.
    """
    from app.config import settings
    fecha_str     = fecha.strftime("%d/%m/%Y %H:%M") if hasattr(fecha, "strftime") else str(fecha)
    fecha_lim_str = fecha_lim.strftime("%d/%m/%Y") if hasattr(fecha_lim, "strftime") else str(fecha_lim)
    canal_str     = "Correo electrónico" if canal == "CORREO_ELECTRONICO" else "Carta al domicilio indicado"
    tipo_str      = "Reclamo" if tipo == "RECLAMO" else "Queja"
    monto_str     = f"S/ {bien_monto:,.2f}" if bien_monto else "—"

    html_body = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;">
          <tr><td style="background:#F5C518;padding:24px;text-align:center;">
            <h1 style="color:#1A3A5C;margin:0;font-size:24px;font-weight:bold;">LatConecta</h1>
            <p style="color:#1A3A5C;margin:4px 0 0;font-size:13px;">Libro de Reclamaciones Virtual — Constancia de Recepción</p>
          </td></tr>
          <tr><td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 12px;">Estimado/a <strong>{nombre}</strong>,</p>
            <p style="color:#555;font-size:14px;margin:0 0 16px;">
              Confirmamos la recepción de su <strong>{tipo_str}</strong>. A continuación el detalle completo:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#FEF9E7;border:2px solid #F5C518;border-radius:6px;margin-bottom:20px;">
              <tr><td style="padding:14px 18px;text-align:center;">
                <p style="margin:0 0 4px;color:#7D5A00;font-size:12px;font-weight:bold;">N° DE RECLAMACIÓN</p>
                <p style="margin:0;color:#1a1a1a;font-size:24px;font-weight:bold;letter-spacing:2px;">{numero}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="6" style="font-size:13px;color:#555;margin-bottom:16px;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;width:42%;padding:6px 0;">Fecha y hora de presentación:</td>
                <td>{fecha_str} (hora Lima)</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Tipo:</td>
                <td>{tipo_str}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Bien o servicio reclamado:</td>
                <td>{bien_desc}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Monto reclamado:</td>
                <td>{monto_str}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Detalle de la reclamación:</td>
                <td>{detalle}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Pedido concreto:</td>
                <td>{pedido}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="font-weight:bold;color:#333;padding:6px 0;">Canal de respuesta elegido:</td>
                <td>{canal_str}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;color:#c0392b;padding:6px 0;">Fecha límite de respuesta:</td>
                <td><strong style="color:#c0392b;">{fecha_lim_str}</strong> (15 días hábiles)</td>
              </tr>
            </table>
            <div style="background:#fef9e7;border:1px solid #f39c12;border-radius:6px;padding:12px 16px;margin-bottom:16px;">
              <p style="margin:0;font-size:12px;color:#7d5a00;">{LEYENDA_ART13}</p>
            </div>
            <p style="color:#555;font-size:13px;margin:0;">
              Puede consultar el estado de su reclamación en nuestro portal ingresando su
              número correlativo y número de documento.
            </p>
          </td></tr>
          <tr><td style="background:#f9f9f9;padding:14px 32px;border-top:1px solid #eee;text-align:center;">
            <p style="color:#aaa;font-size:11px;margin:0;">© 2026 LatConecta — LATCOM Horizons II, LLC</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>"""

    message = MIMEMultipart("alternative")
    message["Subject"] = f"Constancia de Reclamación — N° {numero} — LatConecta"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = to_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True


async def send_complaint_offer(to_email: str, nombre: str, numero: str, oferta: str) -> bool:
    """Notifica al consumidor la propuesta de solución — Art. 6-A DS 101-2022"""
    from app.config import settings
    html_body = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;">
          <tr><td style="background:#F5C518;padding:24px;text-align:center;">
            <h1 style="color:#1A3A5C;margin:0;font-size:24px;font-weight:bold;">LatConecta</h1>
            <p style="color:#1A3A5C;margin:4px 0 0;font-size:13px;">Libro de Reclamaciones Virtual</p>
          </td></tr>
          <tr><td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 12px;">Estimado/a <strong>{nombre}</strong>,</p>
            <p style="color:#555;font-size:14px;margin:0 0 16px;">
              Le informamos que hemos preparado una propuesta de solución para su reclamación
              <strong>N° {numero}</strong>.
            </p>
            <div style="background:#f0faf8;border:1px solid #0d7a6b;border-radius:6px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 6px;color:#0d7a6b;font-size:12px;font-weight:bold;">PROPUESTA DE SOLUCIÓN</p>
              <p style="margin:0;color:#333;font-size:14px;">{oferta}</p>
            </div>
            <div style="text-align:center;margin-bottom:20px;">
              <a href="https://peruse.latconecta.com/reclamaciones/oferta/{numero}"
                 style="background:#F5C518;color:#1A3A5C;padding:12px 28px;border-radius:6px;
                        text-decoration:none;font-weight:bold;font-size:14px;">
                Responder a la Propuesta
              </a>
            </div>
            <div style="background:#fef9e7;border:1px solid #f39c12;border-radius:6px;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#7d5a00;">{LEYENDA_ART13}</p>
            </div>
          </td></tr>
          <tr><td style="background:#f9f9f9;padding:14px;border-top:1px solid #eee;text-align:center;">
            <p style="color:#aaa;font-size:11px;margin:0;">© 2026 LatConecta — LATCOM Horizons II, LLC</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>"""
    message = MIMEMultipart("alternative")
    message["Subject"] = f"Propuesta de Solución — Reclamación N° {numero} — LatConecta"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = to_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True


async def send_complaint_rechazo_admin(
    numero: str, consumidor: str, dias_restantes: int,
    fecha_limite, observacion: str = None
) -> bool:
    """Notifica al admin que el consumidor rechazó la oferta — P-4"""
    from app.config import settings
    fecha_str  = fecha_limite.strftime("%d/%m/%Y") if hasattr(fecha_limite, "strftime") else str(fecha_limite)
    color      = "#c0392b" if dias_restantes <= 3 else "#e67e22" if dias_restantes <= 7 else "#27ae60"
    obs_html   = f"<p><strong>Observación del consumidor:</strong> {observacion}</p>" if observacion else ""
    html_body  = f"""<div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;">
      <div style="background:#F5C518;padding:16px;border-radius:6px 6px 0 0;">
        <h2 style="color:#1A3A5C;margin:0;">⚠ Propuesta Rechazada — Acción Requerida</h2>
      </div>
      <div style="border:1px solid #F5C518;padding:16px;border-radius:0 0 6px 6px;">
        <p>El consumidor ha rechazado la propuesta de solución para la reclamación
           <strong>{numero}</strong>.</p>
        {obs_html}
        <table cellpadding="6" style="font-size:14px;width:100%;">
          <tr><td style="font-weight:bold;">Consumidor:</td><td>{consumidor}</td></tr>
          <tr><td style="font-weight:bold;">Días hábiles restantes:</td>
              <td><strong style="color:{color};">{dias_restantes} día(s)</strong></td></tr>
          <tr><td style="font-weight:bold;">Fecha límite respuesta formal:</td>
              <td><strong style="color:{color};">{fecha_str}</strong></td></tr>
        </table>
        <p style="color:#c0392b;font-weight:bold;">
          Debe emitir una respuesta formal antes del {fecha_str}.
        </p>
      </div>
    </div>"""
    support_email = getattr(settings, "SUPPORT_EMAIL", settings.SMTP_USER)
    message = MIMEMultipart("alternative")
    message["Subject"] = f"[RECHAZO] Reclamación {numero} — Respuesta formal requerida en {dias_restantes}d"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = support_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True


async def send_complaint_rechazo_consumidor(
    to_email: str, nombre: str, numero: str, fecha_limite
) -> bool:
    """Confirma al consumidor que su rechazo fue registrado — P-5"""
    from app.config import settings
    fecha_str = fecha_limite.strftime("%d/%m/%Y") if hasattr(fecha_limite, "strftime") else str(fecha_limite)
    html_body = f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;">
          <tr><td style="background:#F5C518;padding:24px;text-align:center;">
            <h1 style="color:#1A3A5C;margin:0;font-size:24px;font-weight:bold;">LatConecta</h1>
            <p style="color:#1A3A5C;margin:4px 0 0;font-size:13px;">Libro de Reclamaciones Virtual</p>
          </td></tr>
          <tr><td style="padding:28px 32px;">
            <p style="color:#333;font-size:15px;margin:0 0 12px;">Estimado/a <strong>{nombre}</strong>,</p>
            <p style="color:#555;font-size:14px;margin:0 0 16px;">
              Hemos registrado su rechazo a la propuesta de solución para la reclamación
              <strong>N° {numero}</strong>.
            </p>
            <div style="background:#f0f4ff;border:1px solid #2C5F8A;border-radius:6px;padding:14px;margin-bottom:16px;">
              <p style="margin:0;color:#1A3A5C;font-size:14px;">
                Nuestro equipo emitirá una <strong>respuesta formal</strong> a su reclamación
                a más tardar el <strong>{fecha_str}</strong>.
              </p>
            </div>
            <div style="background:#fef9e7;border:1px solid #f39c12;border-radius:6px;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#7d5a00;">{LEYENDA_ART13}</p>
            </div>
          </td></tr>
          <tr><td style="background:#f9f9f9;padding:14px;border-top:1px solid #eee;text-align:center;">
            <p style="color:#aaa;font-size:11px;margin:0;">© 2026 LatConecta — LATCOM Horizons II, LLC</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>"""
    message = MIMEMultipart("alternative")
    message["Subject"] = f"Rechazo Registrado — Reclamación N° {numero} — LatConecta"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = to_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True


async def send_complaint_alert(numero: str, consumidor: str, dias: int, fecha_limite) -> bool:
    """Alerta diaria al admin sobre reclamaciones próximas a vencer"""
    from app.config import settings
    fecha_str = fecha_limite.strftime("%d/%m/%Y") if hasattr(fecha_limite, "strftime") else str(fecha_limite)
    color = "#c0392b" if dias <= 1 else "#e67e22" if dias <= 3 else "#27ae60"
    html_body = f"""<div style="font-family:Arial,sans-serif;padding:20px;">
      <div style="background:#F5C518;padding:12px;border-radius:4px;margin-bottom:12px;">
        <h3 style="color:#1A3A5C;margin:0;">⚠ Reclamación próxima a vencer</h3>
      </div>
      <table cellpadding="6" style="font-size:14px;">
        <tr><td style="font-weight:bold;">N° Correlativo:</td><td>{numero}</td></tr>
        <tr><td style="font-weight:bold;">Consumidor:</td><td>{consumidor}</td></tr>
        <tr><td style="font-weight:bold;">Días restantes:</td>
            <td><strong style="color:{color};">{dias} día(s)</strong></td></tr>
        <tr><td style="font-weight:bold;">Fecha límite:</td>
            <td><strong style="color:{color};">{fecha_str}</strong></td></tr>
      </table>
    </div>"""
    support_email = getattr(settings, "SUPPORT_EMAIL", settings.SMTP_USER)
    message = MIMEMultipart("alternative")
    message["Subject"] = f"[ALERTA] Reclamación {numero} vence en {dias} día(s)"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = support_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True


async def send_complaint_admin_alert(numero: str, motivo: str) -> bool:
    """Alerta al admin sobre situaciones que requieren atención manual"""
    from app.config import settings
    html_body = f"""<div style="font-family:Arial,sans-serif;padding:20px;">
      <h3 style="color:#c0392b;">Atención requerida — Reclamación {numero}</h3>
      <p>{motivo}</p>
    </div>"""
    support_email = getattr(settings, "SUPPORT_EMAIL", settings.SMTP_USER)
    message = MIMEMultipart("alternative")
    message["Subject"] = f"[ATENCIÓN] Reclamación {numero} requiere acción manual"
    message["From"]    = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    message["To"]      = support_email
    message.attach(MIMEText(html_body, "html"))
    await aiosmtplib.send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT,
                          username=settings.SMTP_USER, password=settings.SMTP_PASSWORD, start_tls=True)
    return True
