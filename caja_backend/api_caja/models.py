from django.db import models

class CategoriaMovimiento(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    tipo = models.CharField(max_length=10) # 'INGRESO' o 'EGRESO'
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'categoria_movimiento'
        managed = False  # Django no modificará esta tabla directamente

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"


class MovimientoCaja(models.Model):
    id_movimiento = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=10) # 'INGRESO' o 'EGRESO'
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.CharField(max_length=150, blank=True, null=True)
    id_categoria = models.ForeignKey(
        CategoriaMovimiento, 
        on_delete=models.SET_NULL, 
        db_column='id_categoria', 
        blank=True, 
        null=True
    )
    fecha_operacion = models.DateField(auto_now_add=True)
    fecha_hora_registro = models.DateTimeField(auto_now_add=True)
    

    class Meta:
        db_table = 'movimiento_caja'
        managed = False

    def __str__(self):
        return f"{self.tipo} - S/ {self.monto} ({self.fecha_operacion})"


class CierreDiario(models.Model):
    id_cierre = models.AutoField(primary_key=True)
    fecha = models.DateField(unique=True)
    total_ingresos = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_egresos = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    saldo_final = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cerrado_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cierre_diario'
        managed = False

    def __str__(self):
        return f"Cierre {self.fecha}: S/ {self.saldo_final}"