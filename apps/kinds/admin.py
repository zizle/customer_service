from django.contrib import admin
from apps.admin import admin_site
from .models import Kind

admin_site.register(Kind)
