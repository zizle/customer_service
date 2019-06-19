"""customer_service URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from apps.admin import admin_site
from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from django.contrib.staticfiles.views import serve

urlpatterns = [
    path('admin/', admin_site.urls),
    path(r'', include("users.urls")),
    path(r'', include("customers.urls")),
    path(r'', include("notices.urls")),
    path(r'', include("kinds.urls")),
    path(r'', include("works.urls")),
    path(r'', include("organizations.urls")),
    path(r'docs/', include_docs_urls(title="系统api")),
    path('favicon.ico', serve, {'path': 'static/favicon.ico'}),
]
