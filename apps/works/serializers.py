# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
import time
import os
from rest_framework import serializers
from django.conf import settings
from django.db import transaction
from .models import Work, ReplyWork, SubReplyWork
from users.models import User
from utils.create_notices import create_notice


class WorkSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    user = serializers.SlugRelatedField(read_only=True, slug_field="real_name")
    file = serializers.CharField(read_only=True)

    class Meta:
        model = Work
        fields = '__all__'

    def validate(self, attrs):
        """添加发布回复的用户"""
        user = self.context["request"].user
        if not user:
            raise serializers.ValidationError("请登录后回复..")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        self.save_file(validated_data)
        with transaction.atomic():
            work = super().create(validated_data)
            # 如果这条工作所属的客户不是本用户的客户，那么建立消息
            if work.customer.belong != validated_data["user"]:
                create_notice(
                    type=1,
                    sender=validated_data["user"],
                    receiver=work.customer.belong,
                    customer=work.customer,
                    content=work.customer.name
                )
            return work

    def save_file(self, validated_data):
        request = self.context["request"]
        file = request.FILES.get("file")
        if file:
            uuid = request.POST.get("uuid")
            unique_name = uuid + validated_data["file_name"]
            file_url = time.strftime(settings.FILES_URL) + unique_name
            validated_data["file"] = file_url

            # 保存
            file_root = time.strftime(settings.FILES_ROOT)
            if os.path.exists(file_root):
                pass
            else:
                os.makedirs(file_root)
            file_path = os.path.join(file_root, unique_name)
            f = open(file_path, "wb")
            for chunk in file.chunks():
                f.write(chunk)
            f.close()


class ParentRelateField(serializers.RelatedField):
    """自定义序列化字段值"""
    def to_internal_value(self, data):
        pass

    def to_representation(self, value):
        """自定义parent的返回字段"""
        if len(value.content) > 10:
            content = value.content[:10] + '...'
        else:
            content = value.content
        return "%s: %s" % (value.user, content)


class SubReplySerializer(serializers.ModelSerializer):
    """子回复GET查询序列化器"""
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    user = serializers.SlugRelatedField(read_only=True, slug_field="real_name")
    parent = ParentRelateField(read_only=True)

    class Meta:
        model = SubReplyWork
        fields = "__all__"


class CreateSubReplySerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, write_only=True, label="回复者")  # 用户后台添加

    class Meta:
        model = SubReplyWork
        fields = "__all__"

    def validate(self, attrs):
        """添加发布回复的用户"""
        user = self.context["request"].user
        if not user:
            raise serializers.ValidationError("请登录后回复..")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            sub_reply = super().create(validated_data)
            # 如果当前回复者不是父工作的作者，添加消息
            if sub_reply.parent:
                # 有父级
                reply_user = sub_reply.parent.user
                notice_content = sub_reply.parent.content
            else:
                reply_user = sub_reply.reply.user
                notice_content = sub_reply.reply.content
            if validated_data["user"] != reply_user:
                create_notice(
                    type=1,
                    sender=validated_data["user"],
                    receiver=reply_user,
                    customer=sub_reply.reply.work.customer,
                    content=notice_content
                )
            return sub_reply


class ReplyWorkSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    user = serializers.SlugRelatedField(read_only=True, slug_field="real_name")
    subs = SubReplySerializer(read_only=True, many=True, label="回复的子回复")

    class Meta:
        model = ReplyWork
        fields = '__all__'

    def validate(self, attrs):
        """添加发布回复的用户"""
        user = self.context["request"].user
        if not user:
            raise serializers.ValidationError("请登录后回复..")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            reply = super().create(validated_data)
            # 如果当前回复者不是父工作的作者，添加消息
            if validated_data["user"] != reply.work.user:
                create_notice(
                    type=1,
                    sender=validated_data["user"],
                    receiver=reply.work.user,
                    customer=reply.work.customer,
                    content=reply.work.content
                )
            return reply












