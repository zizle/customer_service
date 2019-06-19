from django.contrib import admin

# Register your models here.
from apps.admin import admin_site
from .models import User, Support


admin_site.register(Support)
admin_site.register(User)
