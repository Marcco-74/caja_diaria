from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from datetime import timedelta
from django.db.models import Sum


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

    def _procesar_cierres_pendientes(self):
        """Calcula y guarda automáticamente los cierres de días pasados que tengan movimientos y no estén cerrados."""
        # Obtener todas las fechas únicas de operaciones que tengan movimientos
        fechas_con_movimientos = MovimientoCaja.objects.dates('fecha_operacion', 'day')
        
        for fecha in fechas_con_movimientos:
            # Si la fecha es anterior a hoy y no existe en CierreDiario, la cerramos
            if fecha < timezone.now().date():
                if not CierreDiario.objects.filter(fecha=fecha).exists():
                    movs_dia = MovimientoCaja.objects.filter(fecha_operacion=fecha)
                    ingresos = movs_dia.filter(tipo='INGRESO').aggregate(total=Sum('monto'))['total'] or 0
                    gastos = movs_dia.filter(tipo='GASTO').aggregate(total=Sum('monto'))['total'] or 0
                    saldo = ingresos - gastos

                    CierreDiario.objects.create(
                        fecha=fecha,
                        total_ingresos=ingresos,
                        total_egresos=gastos, # o total_gastos según tu modelo
                        saldo_final=saldo
                    )


    # Endpoint especial para obtener solo los movimientos del día de hoy
    @action(detail=False, methods=['get'], url_path='hoy')
    def movimientos_hoy(self, request):
        # Primero procesamos cualquier cierre pendiente de días anteriores
        self._procesar_cierres_pendientes()

        hoy = timezone.now().date()
        movimientos = MovimientoCaja.objects.filter(fecha_operacion=hoy).order_by('-fecha_hora_registro')
        serializer = self.get_serializer(movimientos, many=True)
        return Response(serializer.data)


class CierreDiarioViewSet(viewsets.ModelViewSet):
    queryset = CierreDiario.objects.all().order_by('-fecha')
    serializer_class = CierreDiarioSerializer