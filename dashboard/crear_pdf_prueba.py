from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def crear_boleta_prueba():
    """Crea un PDF de boleta de ejemplo para probar"""
    
    # Crear el PDF
    pdf = canvas.Canvas("boleta_prueba.pdf", pagesize=letter)
    
    # Agregar contenido
    y = 750  # Posición vertical inicial
    
    pdf.drawString(100, y, "BOLETA DE COMPRA")
    y -= 30
    
    pdf.drawString(100, y, "Fecha: 2026-01-20")
    y -= 20
    
    pdf.drawString(100, y, "Proveedor: Distribuidora ABC Ltda")
    y -= 40
    
    pdf.drawString(100, y, "--------------------------------")
    y -= 20
    
    pdf.drawString(100, y, "Producto                    Cantidad")
    y -= 20
    
    pdf.drawString(100, y, "--------------------------------")
    y -= 30
    
    # Productos
    productos = [
        "Arroz Tucapel 1kg                  5",
        "Aceite Chef 1L                     2",
        "Azucar Iansa 1kg                   3",
        "Leche Soprole 1L                   10",
        "Pan Ideal 500g                     4",
    ]
    
    for producto in productos:
        pdf.drawString(100, y, producto)
        y -= 25
    
    y -= 10
    pdf.drawString(100, y, "--------------------------------")
    
    # Guardar
    pdf.save()
    print("✅ PDF creado: boleta_prueba.pdf")

if __name__ == "__main__":
    # Instalar reportlab primero:
    # pip install reportlab --break-system-packages
    crear_boleta_prueba()