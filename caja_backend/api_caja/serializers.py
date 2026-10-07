from rest_framework import serializers
from .models import CategoriaMovimiento, MovimientoCaja, CierreDiario

class CategoriaMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaMovimiento
        fields = '__all__'


class MovimientoCajaSerializer(serializers.ModelSerializer):
    # Incluimos información legible de la categoría para el Frontend
    categoria_nombre = serializers.ReadOnlyField(source='id_categoria.nombre')

    class Meta:
        model = MovimientoCaja
        fields = '__all__'


class CierreDiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CierreDiario
        fields = '__all__'