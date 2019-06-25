# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle

from rest_framework import serializers

from .models import Kind


class KindSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kind
        fields = ("id", "name", "change_lib")
