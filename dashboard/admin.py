from django.contrib import admin
from .models import User, Category, Sale, SaleItem, SystemLog, Product, Receipt, ReceiptItem, StockMovement
# Register your models here.
admin.site.register(User)
admin.site.register(Category)
admin.site.register(SystemLog)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'current_stock', 'unit']
    search_fields = ['name', 'sku']

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'supplier', 'receipt_date', 'uploaded_at']
    list_filter = ['status']

@admin.register(ReceiptItem)
class ReceiptItemAdmin(admin.ModelAdmin):
    list_display = ['receipt', 'detected_product_name', 'detected_quantity', 'matched_product', 'confidence_score', 'needs_review']
    list_filter = ['needs_review', 'is_validated']

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['product', 'movement_type', 'quantity', 'previous_stock', 'new_stock', 'created_at']

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'payment_method', 'created_at']
    list_filter = ['payment_method', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'product', 'quantity', 'unit_price', 'subtotal']
    list_filter = ['sale__created_at']
    search_fields = ['product__name', 'sale__id']