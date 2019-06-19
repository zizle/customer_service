# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    # type = serializers.SlugRelatedField(read_only=True, slug_field="name")
    # sender = serializers.SlugRelatedField(read_only=True, slug_field="real_name")
    # receiver = serializers.SlugRelatedField(read_only=True, slug_field="real_name")

    class Meta:
        model = Notice
        fields = '__all__'


class UpdateStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = ("status",)
