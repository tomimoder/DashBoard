from django.db import models

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length = 150)
    email = models.EmailField(unique = True)
    password = models.CharField(max_length = 128)
    role = models.BooleanField(default = False)  # True para admin, False para usuario normal
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.username} ({'Admin' if self.role else 'User'})"


class Category(models.Model):
    name = models.CharField(max_length = 150)
    description = models.TextField(blank = False)

    def __str__(self):
        return self.name
    

class Sale(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    category = models.ForeignKey(Category, on_delete = models.CASCADE)
    amount = models.DecimalField(max_digits = 10, decimal_places = 2)
    date = models.DateTimeField(auto_now_add = True)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"Vendido por {self.user.username} en {self.category.name} - ${self.amount}"
    

class SystemLog(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    action = models.CharField(max_length = 255)
    timestamp = models.DateTimeField(auto_now_add = True)
    metadata = models.JSONField(blank = True, null = True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"