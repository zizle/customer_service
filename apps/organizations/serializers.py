# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
import logging
from rest_framework import serializers
from django.db import transaction

from .models import Organization, Cooperation
from users.models import User
from users.serializers import UserBaseInfoSerializer
from utils.create_notices import create_notice

logger = logging.getLogger("django")


class OrganizationSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    users = UserBaseInfoSerializer(read_only=True, many=True)

    class Meta:
        model = Organization
        fields = ("id", "name", "create_time", "users")

    def create(self, validated_data):
        request_data = self.context["request"].data
        request_uid = request_data.get("user")
        try:
            uid = int(request_uid)
            request_user = User.objects.get(id=uid)
        except Exception as e:
            logger.error("创建部门失败:{}".format(e))
        else:
            with transaction.atomic():
                organization = super().create(validated_data)
                request_user.level = 2
                request_user.leader = True
                request_user.organization = organization
                request_user.save()
                return organization


class SponsorRelateField(serializers.RelatedField):
    """自定义序列化字段值"""
    def to_internal_value(self, data):
        pass

    def to_representation(self, value):
        """自定义parent的返回字段"""
        return "%s" % value.organization.name if value.organization else '未知部门'


class CooperationSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    sponsor = SponsorRelateField(read_only=True)

    class Meta:
        model = Cooperation
        fields = '__all__'

    def validate(self, attrs):
        # 协作发起者
        user = self.context["request"].user
        attrs["sponsor"] = user
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            cooperation = super().create(validated_data)
            receiver = cooperation.organization.users.get(leader=True)
            # 消息
            create_notice(
                type=2,
                sender=cooperation.sponsor,
                receiver=receiver,
                content=cooperation.content,
                status=False
            )
            return cooperation


