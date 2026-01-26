from rest_framework import viewsets
from .serializer import UserSerializer, CategorySerializer, SaleSerializer, SystemLogSerializer, ProductSerializer, ReceiptItemSerializer, ReceiptSerializer, StockMovementSerializer
from .models import Product, Receipt, ReceiptItem, StockMovement, User, Category, Sale, SystemLog
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import action
from django.db.models import Q
from .services.pdf_processor import PDFProcessor

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

class ProductView(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    def get_queryset(self):
        """Permite filtrar productos por búsqueda y categoría"""
        queryset = super().get_queryset()
        
        # Filtro por búsqueda
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(category__icontains=search)
            )
        
        # Filtro por categoría
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('-created_at')

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Obtener lista de categorías únicas"""
        categories = Product.objects.values_list(
            'category', flat=True
        ).distinct().order_by('category')
        return Response(list(filter(None, categories)))


class ReceiptItemView(viewsets.ModelViewSet):
    serializer_class = ReceiptItemSerializer
    queryset = ReceiptItem.objects.all()

    @action(detail=True, methods=['post'])
    def validate_item(self, request, pk=None):
        """Validar un item individual"""
        item = self.get_object()
        
        # Actualizar con las correcciones del usuario
        item.corrected_product_name = request.data.get(
            'corrected_product_name', 
            item.corrected_product_name
        )
        item.corrected_quantity = request.data.get(
            'corrected_quantity', 
            item.corrected_quantity
        )
        item.matched_product_id = request.data.get(
            'matched_product_id',
            item.matched_product_id
        )
        item.validation_notes = request.data.get(
            'validation_notes',
            item.validation_notes
        )
        
        item.is_validated = True
        item.needs_review = False
        item.save()
        
        return Response(ReceiptItemSerializer(item).data)


class ReceiptView(viewsets.ModelViewSet):
    serializer_class = ReceiptSerializer
    queryset = Receipt.objects.all()

    def get_queryset(self):
        """Permite filtrar boletas por estado y fecha"""
        queryset = super().get_queryset()
        
        # Filtro por estado
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtro por fecha desde
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(receipt_date__gte=date_from)
        
        # Filtro por fecha hasta
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(receipt_date__lte=date_to)
        
        return queryset.order_by('-uploaded_at')

    def create(self, request, *args, **kwargs):
        """
        Subir PDF y procesarlo automáticamente
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        receipt = serializer.save()
        
        # Procesar el PDF automáticamente
        try:
            success, message = PDFProcessor.process_receipt(receipt.id)
            
            if not success:
                # Si falla el procesamiento, marcar como error
                receipt.status = 'error'
                receipt.error_message = message
                receipt.save()
        except Exception as e:
            receipt.status = 'error'
            receipt.error_message = str(e)
            receipt.save()
        
        # Recargar el receipt con los datos actualizados
        receipt.refresh_from_db()
        
        return Response(
            ReceiptSerializer(receipt).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        """Reprocesar una boleta"""
        receipt = self.get_object()
        
        # Borrar items anteriores
        receipt.items.all().delete()
        
        # Procesar nuevamente
        success, message = PDFProcessor.process_receipt(receipt.id)
        
        receipt.refresh_from_db()
        return Response({
            'success': success,
            'message': message,
            'receipt': ReceiptSerializer(receipt).data
        })

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Validar una boleta completa"""
        receipt = self.get_object()
        receipt.status = 'validated'
        receipt.save()
        
        return Response(ReceiptSerializer(receipt).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtener estadísticas de boletas"""
        from django.db.models import Count
        
        stats = {
            'total': Receipt.objects.count(),
            'by_status': dict(
                Receipt.objects.values('status').annotate(
                    count=Count('id')
                ).values_list('status', 'count')
            ),
            'needs_review': Receipt.objects.filter(
                status='needs_validation'
            ).count(),
            'pending': Receipt.objects.filter(
                status='pending'
            ).count(),
        }
        return Response(stats)


class StockMovementView(viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    queryset = StockMovement.objects.all()

    def get_queryset(self):
        """Permite filtrar movimientos por producto"""
        queryset = super().get_queryset()
        
        # Filtro por producto
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        # Filtro por tipo de movimiento
        movement_type = self.request.query_params.get('type', None)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        if check_password(password, user.password):
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        if check_password(password, user.password):
            return Response({
                'message': 'Login succesful',
                'user':{
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
    except User.DoesNotExist:
        return Response(
            {"error": "user not found."},
            status=status.HTTP_404_NOT_FOUND
        )
