from dashboard.models import User, Receipt
from dashboard.services.pdf_processor import PDFProcessor
from django.core.files import File

# ============================================
# 1. Obtener un usuario (o crear uno de prueba)
# ============================================
print("1️⃣ Obteniendo usuario...")

# Intenta obtener el primer usuario, si no existe, créalo
try:
    user = User.objects.first()
    if not user:
        print("   ⚠️  No hay usuarios. Creando usuario de prueba...")
        user = User.objects.create(
            username="admin_test",
            email="admin@test.com",
            role=True  # Admin
        )
        user.password = "test123"  # En producción usar make_password()
        user.save()
        print(f"   ✅ Usuario creado: {user.username}")
    else:
        print(f"   ✅ Usuario encontrado: {user.username}")
except Exception as e:
    print(f"   ❌ Error con usuario: {e}")

# ============================================
# 2. Crear Receipt con el PDF
# ============================================
print("\n2️⃣ Creando Receipt con el PDF...")

try:
    # Abrir el archivo PDF
    path = r"C:\Users\tomas\OneDrive\Escritorio\Django-dashboard\dashboard\boleta_prueba.pdf"
    with open(path, 'rb') as pdf_file:
        # Crear el Receipt
        receipt = Receipt.objects.create(
            user=user,
            status='pending'
        )
        # Asignar el archivo
        receipt.pdf_file.save('boleta_prueba.pdf', File(pdf_file))
        receipt.save()
    
    print(f"   ✅ Receipt creado: ID={receipt.id}")
    print(f"   📄 PDF guardado en: {receipt.pdf_file.path}")
    print(f"   📊 Estado: {receipt.status}")
    
except Exception as e:
    print(f"   ❌ Error al crear receipt: {e}")
    exit()

# ============================================
# 3. Procesar la boleta
# ============================================
print("\n3️⃣ Procesando la boleta...")
print("   ⏳ Este proceso puede tomar unos segundos...")

try:
    success, message = PDFProcessor.process_receipt(receipt.id)
    
    if success:
        print(f"   ✅ {message}")
    else:
        print(f"   ❌ Error: {message}")
        exit()
        
except Exception as e:
    print(f"   ❌ Error al procesar: {e}")
    exit()

# ============================================
# 4. Ver los resultados
# ============================================
print("\n4️⃣ Resultados del procesamiento:")

# Recargar el receipt para ver los cambios
receipt.refresh_from_db()

print(f"\n   📊 Estado de la boleta: {receipt.status}")
print(f"   📅 Fecha detectada: {receipt.receipt_date}")
print(f"   🏢 Proveedor detectado: {receipt.supplier}")
print(f"   ⏰ Procesado en: {receipt.processed_at}")

# Ver los items detectados
items = receipt.items.all()
print(f"\n   📦 Items detectados: {items.count()}")

for i, item in enumerate(items, 1):
    print(f"\n   ─── Item {i} ───")
    print(f"   📝 Texto original: '{item.raw_text}'")
    print(f"   🏷️  Producto detectado: '{item.detected_product_name}'")
    print(f"   🔢 Cantidad: {item.detected_quantity}")
    
    if item.matched_product:
        print(f"   ✅ Match: '{item.matched_product.name}'")
        print(f"   📊 Confianza: {item.confidence_score:.1f}%")
    else:
        print(f"   ❌ Sin match")
    
    if item.needs_review:
        print(f"   ⚠️  NECESITA REVISIÓN")
    else:
        print(f"   ✓ OK - No necesita revisión")

print("\n" + "=" * 60)
print("✅ PROCESAMIENTO COMPLETO")
print("=" * 60)
print(f"\n💡 Ahora puedes ver la boleta en el admin de Django:")
print(f"   http://127.0.0.1:8000/admin/dashboard/receipt/{receipt.id}/")

exit()