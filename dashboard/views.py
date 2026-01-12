from rest_framework import viewsets
from .serializer import UserSerializer, CategorySerializer, SaleSerializer, SystemLogSerializer
from .models import User, Category, Sale, SystemLog
# Create your views here.

class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class SaleView(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    queryset = Sale.objects.all()

class SystemLogView(viewsets.ModelViewSet):
    serializer_class = SystemLogSerializer
    queryset = SystemLog.objects.all()