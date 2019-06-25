from django.contrib import admin
from apps.admin import admin_site
from .models import ChangeLib, Kind

admin_site.register(ChangeLib)
admin_site.register(Kind)
