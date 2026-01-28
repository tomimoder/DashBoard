from django.db import models


# Create your models here.

class User(models.Model):
    username = models.CharField(max_length = 150)
    email = models.EmailField(unique = True)
    password = models.CharField(max_length = 128)
    role = models.BooleanField(default = False)  # True para admin, False para usuario normal
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.username} ({'Admin' if self.role else 'User'})"


class Category(models.Model):
    name = models.CharField(max_length = 150)
    description = models.TextField(blank = False)

    def __str__(self):
        return self.name
    

class Sale(models.Model):
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Efectivo'),
        ('card', 'Tarjeta'),
        ('transfer', 'Transferencia'),
    ]

    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'sales')
    total_amount = models.DecimalField(max_digits = 10, decimal_places = 2)
    payment_method = models.CharField(max_length = 20, choices = PAYMENT_METHOD_CHOICES, default = 'cash')
    notes = models.TextField(blank = True, null = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"Venta {self.id} - ${self.total_amount} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-created_at']




class SystemLog(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    action = models.CharField(max_length = 255)
    timestamp = models.DateTimeField(auto_now_add = True)
    metadata = models.JSONField(blank = True, null = True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"
    


class Product(models.Model):
    # "Representa un producto del inventario"

    name = models.CharField(max_length = 200)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Precio unitario del producto"
    )
    # Código único de un producto. POR AHORA ES OPCIONAL.
    sku = models.CharField(max_length = 100, unique = True, null = True, blank = True)
    category = models.CharField(max_length = 100, null = True, blank = True)
    current_stock = models.IntegerField(default = 0)
    # Unidad de medida de los productos
    unit = models.CharField(max_length = 50, default = "unidad")
    created_at = models.DateTimeField(auto_now_add = True)
    # Fecha de la última actualización del producto
    updated_at = models.DateTimeField(auto_now = True)

    def __str__ (self):
        return f"{self.name} - Stock: {self.current_stock}"
    


class Receipt(models.Model):
    # "Representa una boleta PDF"

    # Opciones de estado que puede tener una boleta
    STATUS_CHOICES = [
        ('pending', 'Pendiente de procesar'),               # Recien subida la boleta
        ('processing', 'Procesando'),                       # Extrayendo texto
        ('needs_validation', 'Requiere validación'),        # Listo para revisar
        ('validated', 'Validado'),                          # Usuario confirmó
        ('completed', 'Completado'),                        # Stock actualizado
        ('error', 'Error'),                                 # Falló algo
    ]


    # Usuario que subió la boleta
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    pdf_file = models.FileField(upload_to = 'recipts/%Y/%m/')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    supplier = models.CharField(max_length=200, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    # Fecha de la boleta
    receipt_date = models.DateField(null = True, blank = True)
    # Texto extraído del PDF
    raw_text = models.TextField(null = True, blank = True)
    uploaded_at = models.DateTimeField(auto_now_add = True)
    # Error message en caso de que falle el procesamiento
    error_message = models.TextField(null = True, blank = True)

    def __str__(self):
        return f"Boleta {self.id} - {self.status} - {self.uploaded_at.strftime('%Y-%m-%d')} - Subida por {self.user.username}"
    


class ReceiptItem(models.Model):
    # "Representa un producto detectado dentro de una boleta"

    # Boleta a la que pertenece el item
    receipt = models.ForeignKey(Receipt, on_delete = models.CASCADE, related_name = 'items')
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Precio del producto al momento de la validación"
    )
    # Texto original detectado en la boleta
    raw_text = models.CharField(max_length = 500)
    detected_product_name = models.CharField(max_length = 200)
    detected_quantity = models.DecimalField(max_digits = 10, decimal_places = 2, null = True, blank = True)
    detected_unit = models.CharField(max_length = 50, null = True, blank = True)
    # Producto del catálogo que mejor coincide con lo detectado
    matched_product = models.ForeignKey(Product, on_delete = models.SET_NULL, null = True, blank = True)
    # Porcentaje de confianza de la coincidencia
    confidence_score = models.FloatField(null = True, blank = True)
    # Validación manual por parte del usuario
    is_validated = models.BooleanField(default = False)
    # Se necesita validacion del usuario este item
    needs_review = models.BooleanField(default = False)
    # Notas de validación manual
    validation_notes = models.TextField(null = True, blank = True)
    # Correccion manual del nombre del producto
    corrected_product_name = models.CharField(max_length = 200, null = True, blank = True)
    # Correccion manual de la cantidad
    corrected_quantity = models.DecimalField(max_digits = 10, decimal_places = 2, null = True, blank = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.detected_product_name} x {self.detected_quantity}"
    

class StockMovement(models.Model):
    # "Representa un movimiento de stock (entrada o salida)"

    # Tipos de movimientos posibles 
    MOVEMENT_TYPES = [
        ('receipt', 'Entrada por boleta'),      # LLegó mercadería
        ('sale', 'Salida por venta'),           # se vendió mercadería
        ('adjustment', 'Ajuste manual'),        # Corrección manual
    ]

    # Producto al que afecta el movimiento
    product = models.ForeignKey(Product, on_delete = models.CASCADE)
    # Si el movimeinto viene de una boleta
    receipt_item = models.ForeignKey(ReceiptItem, on_delete = models.SET_NULL, null = True, blank = True)
    movement_type = models.CharField(max_length = 20, choices = MOVEMENT_TYPES)
    # Cantidad del movimiento (positiva para entradas, negativa para salidas)
    quantity = models.DecimalField(max_digits = 10, decimal_places = 2)
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    notes = models.TextField(null = True, blank = True)
    created_at = models.DateTimeField(auto_now_add = True)
    # Usuario que realizó el movimiento
    created_by = models.ForeignKey(User, on_delete = models.SET_NULL, null = True, blank = True)

    def __str__(self):
        return f"{self.product.name}: {self.previous_stock} -> {self.new_stock}"
    
    


class SaleItem(models.Model):
    
    sale = models.ForeignKey(Sale, on_delete = models.CASCADE, related_name = 'items')
    product = models.ForeignKey(Product, on_delete = models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits = 10, decimal_places = 2)
    subtotal = models.DecimalField(max_digits = 10, decimal_places = 2)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} = ${self.subtotal}"
    
    def save(self, *args, **kwargs):
        # Calcular subtotal antes de guardar
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)