import pdfplumber # Extraer texto de pdf
import re # Sirve para buscar patrones en el texto
from rapidfuzz import fuzz # Comparar similitud entre strings
from decimal import Decimal
from datetime import datetime
from dashboard.models import Product, Receipt, ReceiptItem

class PDFProcessor:
    # "Clase para procesar boletas en PDF"

    # @staticmethod significa que NO necesitas craer una isntancia de la clase. Se puede llamar directamente: PDFProcessor.extract_text(path)

    @staticmethod
    def extract_text(pdf_path: str) -> str:
        try:
            text = ""
            # Abrir el PDF y extraer texto
            with pdfplumber.open(pdf_path) as pdf:
                # Iterar por cada pagina del pdf
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        
        except Exception as e:
            raise RuntimeError(f"Error al extraer texto del PDF: {str(e)}")
        

    @staticmethod
    def normalize_text(text: str) -> str:
        # Limpiar y normalizar el texto extraído del PDF
        lines = text.split('\n')
        cleaned_lines = []

        for line in lines:
            # Quitar espacios multiples en cada línea
            line = re.sub(r'\s+', ' ', line)
            line = line.strip()

            if line:
                cleaned_lines.append(line)
        
        text = '\n'.join(cleaned_lines)
        text = text.lower()

        return text
    
    
    @staticmethod
    def extract_metadata(text):
        # Intentar extraer la FECHA y el PROVEEDOR del texto de la boleta
        # Diccionario donde guardaremos lo que encotnremos
        metadata = {
            'date': None,
            'supplier': None
        }

        # Lista de patrones de fecha para buscar la fecha
        date_patterns = [
        r'fecha:\s*(\d{2}-\d{2}-\d{4})',
        r'fecha:\s*(\d{2}/\d{2}/\d{4})',
    ]

        for pattern in date_patterns:
            # re.search busca el patrón en el texto
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                try:
                    date_str = match.group(1)

                    # Convertir el string a objeto Date
                    if '/' in date_str:
                        metadata['date'] = datetime.strptime(date_str, '%d/%m/%Y').date()
                    else:
                        metadata['date'] = datetime.strptime(date_str, '%Y-%m-%d').date()

                    break

                except:
                    pass

        
        # Buscar proveedor
        supplier_match = re.search(r'proveedor:\s*([^\n]+)', text, re.IGNORECASE)

        if supplier_match:
            # Guardar el proveedor y quitar espacios al inicio/final
            metadata['supplier'] = supplier_match.group(1).strip()
        
        return metadata
    
    @staticmethod
    def parse_items(text):
        """
        FORMATO ESPERADO DE LA BOLETA:
        --------------------------------
        Producto Cantidad
        --------------------------------
        Arroz Tucapel 1kg 5
        Aceite Chef 1L 2
        Azúcar Iansa 1kg 3
        --------------------------------
        """

        items = []
        lines = text.split('\n')

        in_products_section = False
        separator_count = 0

        for line in lines:
            line = line.strip()

            # Ignorar líneas vacías
            if not line:
                continue

            # Detectar líneas separadoras (----------)
            if line.replace('-', '').strip() == '':
                separator_count += 1
                # Después del segundo separador, estamos en productos
                # Después del tercer separador, terminamos
                if separator_count == 2:
                    in_products_section = True
                elif separator_count == 3:
                    break
                continue

            # Detectar línea de encabezado "producto cantidad"
            if 'producto' in line.lower() and 'cantidad' in line.lower():
                in_products_section = True
                continue

            # Detectar fin de sección
            if 'total' in line.lower() and in_products_section:
                break

            # Si estamos en la sección de productos, parsear la línea
            if in_products_section:
                parts = line.split()

                if len(parts) >= 2:
                    try:
                        quantity = None
                        product_name = None

                        # Buscar el número (cantidad) desde el final
                        for i in range(len(parts) - 1, -1, -1):
                            try:
                                quantity = Decimal(parts[i])
                                product_name = ' '.join(parts[:i])
                                break
                            except:
                                continue

                        if quantity and product_name:
                            items.append({
                                'raw_text': line,
                                'name': product_name.strip(),
                                'quantity': quantity
                            })
                        else:
                            # No se pudo parsear correctamente
                            items.append({
                                'raw_text': line,
                                'name': line,
                                'quantity': None,
                                'needs_review': True
                            })

                    except Exception as e:
                        items.append({
                            'raw_text': line,
                            'name': line,
                            'quantity': None,
                            'needs_review': True
                        })

        return items    
    
    # Matching con productos existentes
    @staticmethod
    def match_product(detected_name, threshold=85):

        # Busca en la BD el producto que más se parece al nombre detectado.
        all_products = Product.objects.all()

        best_match = None
        best_score = 0

        # Comparar con cada producto
        for product in all_products:

            score = fuzz.ratio(
                detected_name.lower(),
                product.name.lower()
            )

            if score > best_score and score >= threshold:
                best_score = score
                best_match = product

        return best_match, best_score
    

    @classmethod
    def process_receipt(cls, receipt_id):
        # Esta función llama a todos los anteriores en el orden correcto.

        try:
            # Buscar la boleta en la BD
            receipt = Receipt.objects.get(id=receipt_id)
            receipt.status = 'processing'
            receipt.save()

            # Extraer texto
            text = cls.extract_text(receipt.pdf_file.path)

            # Normalizar texto
            normalized_text = cls.normalize_text(text)

            # Guardar el texto original para referencia
            receipt.raw_text = text

            # Extraer metadata
            metadata = cls.extract_metadata(normalized_text)
            receipt.supplier = metadata['supplier']
            receipt.receipt_date = metadata['date']

            # Parsear items
            parsed_items = cls.parse_items(normalized_text)

            # Matching y crear ReceiptItems
            for item_data in parsed_items:

                # Hacer matching con productos existentes
                matched_product, confidence = cls.match_product(item_data['name'])

                # Crear ReceiptItem
                ReceiptItem.objects.create(
                    receipt=receipt,
                    raw_text=item_data['raw_text'],
                    detected_product_name=item_data['name'],
                    detected_quantity=item_data['quantity'],
                    matched_product=matched_product,
                    confidence_score=confidence if matched_product else None,
                    needs_review=(
                        item_data.get('needs_review', False) or
                        (confidence < 80 if matched_product else True)
                    )
                )

            # Actualizar status
            receipt.status = 'needs_validation'
            receipt.processed_at = datetime.now()
            receipt.save()

            return True, "Procesado existosamente."
        
        except Exception as e:

            receipt.status = 'error'
            receipt.error_message = str(e)
            receipt.save()
            return False, str(e)



"""
    Falta crear la vista (front y back) de validar items de la boleta, una vez validada guardar el item dentro de la bdd y luego crear vista (back y front) para ver el inventario actualizado.
"""