from rest_framework import viewsets, status
from .serializer import SaleDetailSerializer, SaleItemReadSerializer, UserSerializer, CategorySerializer, SaleSerializer, SystemLogSerializer, ProductSerializer, ReceiptItemSerializer, ReceiptSerializer, StockMovementSerializer, SaleSerializer, SaleListSerializer 
from .models import Product, Receipt, ReceiptItem, StockMovement, User, Category, Sale, SystemLog, SaleItem
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import action
from django.db.models import Q
from .services.pdf_processor import PDFProcessor
from django.db import transaction
from django.utils import timezone
# Create your views here.

class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class SaleView(viewsets.ModelViewSet):
    queryset = Sale.objects.all()

    def get_serializer_class(self):

        if self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def get_queryset(self):
        """Permite filtrar ventas por usuario y fecha"""
        queryset = super().get_queryset()

        # Filtro por fecha desde
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(created_at__gte = date_from)

        # Filtro por fecha hasta
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(created_at__lte = date_to)

        # Filtro por método de pago
        payment_method = self.request.query_params.get('payment_method', None)
        if payment_method:
            queryset =queryset.filter(payment_method = payment_method)

        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Crear una nueva venta"""
        serializer = SaleSerializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status = status.HTTP_400_BAD_REQUEST
            )
        
        try:
            sale = serializer.save()

            return Response(
                SaleSerializer(sale).data,
                status = status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    @action(detail = False, methods = ['get'])
    def stats(self, request):
        # Obtener estadísticas de ventas

        from django.db.models import Count, Sum, Avg
        from datetime import timedelta, datetime

        # Ventas del día
        today = datetime.now().date()
        today_sales = Sale.objects.filter(created_at__date = today)

        # Ventas del mes
        month_start = datetime.now().replace(day = 1).date()
        month_sales = Sale.objects.filter(created_at__date__gte = month_start)

        stats = {
            'today': {
                'count': today_sales.count(),
                'total': today_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            },
            'this_month': {
                'count': month_sales.count(),
                'total': month_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'average': month_sales.aggregate(Avg('total_amount'))['total_amount__avg'] or 0
            },
            'payment_methods': dict(
                Sale.objects.values('payment_method').annotate(
                    count=Count('id'),
                    total=Sum('total_amount')
                ).values_list('payment_method', 'total')
            )
        }

        return Response(stats)

class SaleItemView(viewsets.ReadOnlyModelViewSet):
    serializer_class = SaleItemReadSerializer 
    queryset = SaleItem.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()

        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset.order_by('-sale__created_at')


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

        # Obtener datos del request
        matched_product_id = request.data.get('matched_product_id')
        if matched_product_id:
            try:
                product = Product.objects.get(id=matched_product_id)
                item.matched_product = product
                item.confidence_score = 100.0
            except Product.DoesNotExist:
                return Response(
                    {"error": "Product not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        # Actualizar correcciones
        if 'corrected_product_name' in request.data:
            item.corrected_product_name = request.data['corrected_product_name']
        if 'corrected_quantity' in request.data:
            item.corrected_quantity = request.data['corrected_quantity']
        if 'validation_notes' in request.data:
            item.validation_notes = request.data['validation_notes']

        # Marcar como valido
        item.is_validated = True
        item.needs_review = False
        item.save()

        return Response(
            ReceiptItemSerializer(item).data,
            status=status.HTTP_200_OK
        )





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
        
        unvalidated = receipt.items.filter(is_validated=False).count()

        if unvalidated > 0:
            return Response(
                {"error": "Hay items sin validar."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        receipt.status = 'validated'
        receipt.save()
        return Response(ReceiptSerializer(receipt).data)
    
    @action(detail=True, methods=['post'])
    def apply_to_inventory(self, request, pk=None):
        # Aplicar una boleta valida al inventario

        receipt = self.get_object()

        if receipt.status != 'validated':
            return Response(
                {"error": "La boleta debe estar validada para aplicar al inventario."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if receipt.items.filter(is_validated=False).exists():
            return Response(
                {"error": "Todos los items deben estar validados."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                applied_items = []

                for item in receipt.items.all():
                    product = item.matched_product

                    if not product:
                        return Response(
                            {"error": f"El item {item.id} no tiene un producto asociado."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    quantity = item.corrected_quantity if item.corrected_quantity else item.detected_quantity

                    if not quantity or quantity <= 0:
                        return Response(
                            {"error": f"El item {item.id} tiene una cantidad inválida."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    previous_stock = product.current_stock

                    product.current_stock += int(quantity)
                    product.save()

                    # Crear movimiento de stock
                    StockMovement.objects.create(
                        product=product,
                        receipt_item=item,
                        movement_type='receipt',
                        quantity=quantity,
                        previous_stock=previous_stock,
                        new_stock=product.current_stock,
                        created_by=receipt.user,
                        notes=f'Entrada por boleta #{receipt.id} - {receipt.supplier or "Sin proveedor"}'
                    )
                    
                    applied_items.append({
                        'product': product.name,
                        'quantity': str(quantity),
                        'previous_stock': previous_stock,
                        'new_stock': product.current_stock
                    })
                
                # Marcar como completada
                receipt.status = 'completed'
                receipt.save()

                return Response({
                    'success': True,
                    'message': f'Se aplicaron {len(applied_items)} productos al inventario',
                    'applied_items': applied_items,
                    'receipt': ReceiptSerializer(receipt).data
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error al aplicar al inventario: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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



