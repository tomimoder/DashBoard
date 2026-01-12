from django.urls import path, include
from rest_framework import routers
from dashboard import views


router = routers.DefaultRouter()
router.register(r'users', views.UserView, 'users')
router.register(r'categories', views.CategoryView, 'categories')
router.register(r'sales', views.SaleView, 'sales')
router.register(r'systemlogs', views.SystemLogView, 'systemlogs')



urlpatterns = [
    path('api/v1/', include(router.urls)),
]