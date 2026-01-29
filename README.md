# DashBoard – Sistema de Inventario

Proyecto personal desarrollado con el objetivo de **aprender y aplicar buenas prácticas en Django y React**, simulando un sistema real de gestión de inventario con procesamiento automático de documentos.

## Descripción General

DashBoard es una aplicación web full-stack que permite la **gestión de inventario** mediante un panel administrativo con **rutas protegidas**, procesamiento de **boletas en PDF** y visualización de métricas clave a través de gráficos.

El sistema está diseñado como un caso práctico enfocado en arquitectura backend–frontend desacoplada, control de acceso, persistencia de datos y visualización analítica.

## Funcionalidades

### Gestión de Usuarios
- Autenticación con rutas protegidas.
- Usuario administrador con capacidad de crear nuevos usuarios.

### Procesamiento de Boletas (PDF)
- Carga de boletas en formato PDF.
- Lectura y procesamiento automático de productos *(actualmente soporta un solo tipo de boleta)*.
- Validación manual de productos antes de persistirlos en la base de datos.

### Inventario
- Visualización general de productos.
- Clasificación automática de stock:
  - Bajo
  - Medio
  - Alto
- Historial por producto:
  - Ingresos al inventario (fecha y cantidad).
  - Ventas realizadas (fecha y cantidad).

### Dashboard Analítico
- Resumen general del inventario.
- Gráficos:
  - Top 5 productos con mayor movimiento.
  - Distribución de niveles de stock.
  - Movimientos de stock de los últimos 10 días.

### Simulador de Ventas
- Simulación de ventas para disminuir stock.
- Generación de historial de movimientos.
- Enfocado en pruebas de lógica de negocio.

## Stack Tecnológico

### Backend
- Django
- Django REST Framework
- Base de datos relacional

### Frontend
- React
- JavaScript
- Consumo de API REST

## Estructura del Proyecto

```
DJANGO-DASHBOARD/
│
├── dashboard/           # Aplicación Django principal
├── Dashboard_Front/     # Frontend React
├── django_dashboard/    # Configuración del proyecto Django
├── recipts/             # Módulo de procesamiento de boletas
├── venv/                # Entorno virtual Python
├── db.sqlite3           # Base de datos SQLite
├── manage.py            # Script de gestión Django
```

## Ejecución del Proyecto

### Backend
Desde la carpeta raíz del proyecto:

```bash
python manage.py runserver
```

### Frontend

```bash
cd Dashboard_Front
npm install
npm run dev
```

## Objetivo del Proyecto

Proyecto desarrollado como ejercicio práctico para:

- Comprender el flujo completo de una aplicación web.
- Implementar lógica de negocio realista.
- Aplicar separación de responsabilidades.
- Trabajar con datos históricos y visualización.

## Contacto

Para recomendaciones u observaciones:

📧 tmoderg@gmail.com
