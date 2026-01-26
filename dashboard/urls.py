from django.urls import path, include
from rest_framework import routers
from dashboard import views
from .views import UserView, CategoryView, SaleView, SystemLogView, login, ProductView, ReceiptItemView, ReceiptView, StockMovementView
from .services.pdf_processor import PDFProcessor

router = routers.DefaultRouter()
router.register(r'users', views.UserView, 'users')
router.register(r'categories', views.CategoryView, 'categories')
router.register(r'sales', views.SaleView, 'sales')
router.register(r'systemlogs', views.SystemLogView, 'systemlogs')
router.register(r'products', views.ProductView, basename='products')
router.register(r'receipts', views.ReceiptView, basename='receipts')
router.register(r'receipt-items', views.ReceiptItemView, basename='receipt-items')
router.register(r'stock-movements', views.StockMovementView, basename='stock-movements')



urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
]