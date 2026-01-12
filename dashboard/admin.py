from django.contrib import admin
from .models import User, Category, Sale, SystemLog
# Register your models here.
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Sale)
admin.site.register(SystemLog)