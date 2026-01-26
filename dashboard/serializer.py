from rest_framework import serializers
from .models import User, Category, Sale, SystemLog, Product, Receipt, ReceiptItem, StockMovement
from django.contrib.auth.hashers import make_password

# Serializer se usa para hacer una "traducción" entre los modelos de Django y formatos como JSON o XML.
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        user = User(**validated_data)

        #encrypt password
        if password:
            user.password = make_password(password)

        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = ['id', 'user', 'category', 'amount', 'date', 'created_at']

class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = ['id', 'user', 'action', 'timestamp', 'metadata']
        

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            'id',             # ID del producto (automático)
            'name',           # Nombre del producto
            'sku',            # Código SKU
            'category',       # Categoría
            'current_stock',  # Stock actual
            'unit',           # Unidad de medida
            'created_at'      # Fecha de creación
        ]

class ReceiptItemSerializer(serializers.ModelSerializer):
    matched_product_name = serializers.CharField(
        source='matched_product.name',
        read_only=True
    )

    class Meta:
        model = ReceiptItem
        
        fields = [
            'id',
            
            # Datos detectados del PDF
            'raw_text',                  # Línea original
            'detected_product_name',     # Nombre detectado
            'detected_quantity',         # Cantidad detectada
            'detected_unit',             # Unidad detectada
            
            # Matching
            'matched_product',           # ID del producto (ForeignKey)
            'matched_product_name',      # Nombre del producto (calculado)
            'confidence_score',          # % de confianza
            
            # Validación
            'is_validated',              # ¿Ya lo revisó el usuario?
            'needs_review',              # ¿Necesita revisión?
            
            # Correcciones
            'corrected_product_name',    # Si el usuario corrigió el nombre
            'corrected_quantity',        # Si el usuario corrigió la cantidad
        ]


class ReceiptSerializer(serializers.ModelSerializer):
    items = ReceiptItemSerializer(many=True, read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    items_count = serializers.SerializerMethodField()
    items_needing_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'user', 'user_details', 'pdf_file', 'status',
            'supplier', 'receipt_date', 'raw_text', 'uploaded_at',
            'processed_at', 'error_message', 'items', 'items_count',
            'items_needing_review'
        ]
        read_only_fields = [
            'id', 'uploaded_at', 'processed_at', 
            'raw_text', 'error_message', 'status'  
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_items_needing_review(self, obj):
        return obj.items.filter(needs_review=True).count()

class StockMovementSerializer(serializers.ModelSerializer):
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id',
            'product',              # ID del producto
            'product_name',         # Nombre del producto (calculado)
            'movement_type',        # Tipo de movimiento
            'quantity',             # Cantidad
            'previous_stock',       # Stock anterior
            'new_stock',            # Stock nuevo
            'notes',                # Notas
            'created_at',           # Fecha
            'created_by',           # ID del usuario
            'created_by_username',  # Username (calculado)
        ]
        read_only_fields = [
            'created_at',
        ]   
