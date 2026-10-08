from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='MovimientoCaja',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(max_length=10)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=10)),
                ('descripcion', models.CharField(blank=True, max_length=255, null=True)),
                ('fecha_hora_registro', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'movimiento_caja',
            },
        ),
    ]