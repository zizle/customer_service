from django.contrib import admin

# Register your models here.
from apps.admin import admin_site
from .models import Organization, Cooperation
admin_site.register(Organization)
admin_site.register(Cooperation)
