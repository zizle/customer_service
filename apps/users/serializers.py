# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.db import transaction
from rest_framework import serializers
from .models import User, Support
from customers.models import Customer
from utils.create_notices import create_notice


class FilterDeleteUserSerializer(serializers.ListSerializer):
    """ 过滤条件 """
    def to_representation(self, data):
        data = data.filter(is_active=True)  # 符合条件的返回
        return super(FilterDeleteUserSerializer, self).to_representation(data)


class FilterDeleteCustomerSerializer(serializers.ListSerializer):
    """ 过滤逻辑删除的客户 """
    def to_representation(self, data):
        data = data.filter(delete=False)
        return super(FilterDeleteCustomerSerializer, self).to_representation(data)


class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"

        extra_kwargs = {
            'username': {
                'min_length': 5,
                'max_length': 20,
                'error_messages': {
                    'min_length': '仅允许5-20个字符的用户名',
                    'max_length': '仅允许5-20个字符的用户名'
                }
            },
            'password': {
                'write_only': True,
                'min_length': 6,
                'max_length': 20,
                'error_messages': {
                    'min_length': '仅允许6-20个字符的密码',
                    'max_length': '仅允许6-20个字符的密码'
                }
            }
        }

    def create(self, validated_data):
        # 创建用户
        with transaction.atomic():
            user = super().create(validated_data)
            user.set_password(validated_data['password'])  # 密文保存密码
            user.save()
            # 创建系统消息
            request_user = self.context["request"].user
            # 修改普通用户为小组管理员
            if request_user.level > 3:
                request_user.level = 3
                request_user.save()

            create_notice(
                type=3,
                sender=request_user,
                receiver=user,
                content="今天是个特别的一天，您的账号就在这美好的日子诞生了！欢迎加入瑞达期货。"
            )
            return user


class UserBaseInfoSerializer(serializers.ModelSerializer):
    """用户基础信息序列化器"""
    date_joined = serializers.DateTimeField(format("%Y-%m-%d %H:%M:%S"), read_only=True)
    last_login = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    level = serializers.ChoiceField(choices=User.LEVEL, source="get_level_display", read_only=True)

    class Meta:
        list_serializer_class = FilterDeleteUserSerializer
        model = User
        fields = ("id", "username", "date_joined", "last_login", "level", "real_name", "organization")
        # read_only_fields = ('gmt_create', 'gmt_modify', 'is_deleted')


class UserSerializer(UserBaseInfoSerializer):
    organization = serializers.SlugRelatedField(read_only=True, slug_field="name")

    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            'password': {
                "write_only": True,
            }
        }


class UserCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        list_serializer_class = FilterDeleteCustomerSerializer  # 过滤逻辑删除的客户
        model = Customer
        fields = ("id", "name")


class ListUserSerializer(UserSerializer):
   customers = UserCustomerSerializer(many=True, read_only=True)


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "real_name")


class SupportSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    sponsor = serializers.SlugRelatedField(read_only=True, slug_field="real_name")

    class Meta:
        model = Support
        fields = '__all__'

    def validate(self, attrs):
        # 协作发起者
        user = self.context["request"].user
        # 对应的客户
        data = self.context["request"].data
        if data.get("content") == "authorization":
            cid = data.get("customer")
            customer = Customer.objects.get(id=cid)
            attrs["content"] = "请求授权修改客户<"+customer.name+">的信息。"
            attrs["type"] = 2
        attrs["sponsor"] = user

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            support = super().create(validated_data)
            data = self.context["request"].data
            # 建立消息通知
            if data.get("content") == "authorization":
                create_notice(
                    type=4,
                    sender=support.sponsor,
                    receiver=support.sponsor.parent,
                    content="客户<p>--" + support.customer.name + "--</p>信息修改待授权。",
                )
            else:
                create_notice(
                    type=2,
                    sender=support.sponsor,
                    receiver=support.sponsor.parent,
                    content=support.content,
                    organization=support.sponsor.parent.organization  # 请求支持者上级的部门
                )
        return support







