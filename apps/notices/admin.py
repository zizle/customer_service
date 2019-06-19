from django.contrib import admin

# Register your models here.
from apps.admin import admin_site
from .models import Notice
admin_site.register(Notice)

