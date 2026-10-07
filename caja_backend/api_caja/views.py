from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import CategoriaMovimiento, MovimientoCaja, CierreDiario
from .serializers import (
    CategoriaMovimientoSerializer,
    MovimientoCajaSerializer,
    CierreDiarioSerializer
)

class CategoriaMovimientoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaMovimiento.objects.filter(activo=True)
    serializer_class = CategoriaMovimientoSerializer


class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.all().order_by('-fecha_hora_registro')
    serializer_class = MovimientoCajaSerializer

    # Endpoint especial para obtener solo los movimientos del día de hoy
    @action(detail=False, methods=['get'], url_path='hoy')
    def movimientos_hoy(self, request):
        hoy = timezone.now().date()
        movimientos = MovimientoCaja.objects.filter(fecha_operacion=hoy).order_by('-fecha_hora_registro')
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)


class CierreDiarioViewSet(viewsets.ModelViewSet):
    queryset = CierreDiario.objects.all().order_by('-fecha')
    serializer_class = CierreDiarioSerializer