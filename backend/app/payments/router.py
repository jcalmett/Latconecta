from fastapi import APIRouter
from . import schemas, service

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

@router.post("/create")
def create_payment(payload: schemas.PaymentCreateRequest):
    """
    Crea una orden de pago en modo sandbox.
    No persiste en base de datos.
    Retorna datos mínimos necesarios para iniciar Izipay Web Core.
    """
    return service.create_payment_order(payload.amount)
