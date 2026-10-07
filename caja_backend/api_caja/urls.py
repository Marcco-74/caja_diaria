from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaMovimientoViewSet, MovimientoCajaViewSet, CierreDiarioViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaMovimientoViewSet)
router.register(r'movimientos', MovimientoCajaViewSet)
router.register(r'cierres', CierreDiarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]