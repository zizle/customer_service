# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
import time
import os
from rest_framework import serializers
from django.conf import settings
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    belong = serializers.SlugRelatedField(slug_field="real_name", read_only=True)
    card = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'

    def create(self, validated_data):
        validated_data["belong"] = self.context["request"].user
        self.save_card(validated_data)
        customer = super().create(validated_data)
        return customer

    def update(self, instance, validated_data):
        self.save_card(validated_data)
        super().update(instance, validated_data)
        return instance

    def save_card(self, validated_data):
        """保存上传的客户名片"""
        request = self.context["request"]
        card = request.FILES.get("card_image")
        if card:
            uuid = request.POST.get("uuid")
            unique_name = uuid + validated_data["card_name"]
            card_url = time.strftime(settings.IMAGE_URL) + unique_name
            validated_data["card"] = card_url

            # 保存图片
            card_root = time.strftime(settings.IMAGE_ROOT)
            # 创建文件夹
            if os.path.exists(card_root):
                pass
            else:
                os.makedirs(card_root)
            card_path = os.path.join(card_root, unique_name)
            f = open(card_path, 'wb')
            for chunk in card.chunks():
                f.write(chunk)
            f.close()

#
# class WorkSerializer(serializers.ModelSerializer):
#     create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#     update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#
#     class Meta:
#         model = Work
#         fields = "__all__"
#
#     def create(self, validated_data):
#         self.save_file(validated_data)
#         work = super().create(validated_data)
#         return work
#
#     def save_file(self, validated_data):
#         request = self.context["request"]
#         file = validated_data.get("file")
#         if file:
#             uuid = request.POST.get("uuid")
#             unique_name = uuid + validated_data["file_name"]
#             file_url = time.strftime(settings.FILES_URL) + unique_name
#             validated_data["file"] = file_url
#
#             # 保存
#             file_root = time.strftime(settings.FILES_ROOT)
#             if os.path.exists(file_root):
#                 pass
#             else:
#                 os.makedirs(file_root)
#             file_path = os.path.join(file_root, unique_name)
#             f = open(file_path, "wb")
#             for chunk in file.chunks():
#                 f.write(chunk)
#             f.close()
#
#
# class SubWorkSerializer(serializers.ModelSerializer):
#     create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#     update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#     user = serializers.SlugRelatedField(slug_field="real_name", read_only=True)
#
#     class Meta:
#         model = SubWork
#         fields = "__all__"
#
#     def validate(self, attrs):
#         """添加发布回复的用户"""
#         user = self.context["request"].user
#         if not user:
#             raise serializers.ValidationError("请登录后回复..")
#         attrs["user"] = user
#         return attrs
#
#
# class WorkRetrieveSerializer(serializers.ModelSerializer):
#     create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#     update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
#     user = serializers.SlugRelatedField(slug_field="real_name", read_only=True)
#     file = serializers.CharField(label="附件", read_only=True)
#     subs = SubWorkSerializer(allow_null=True, many=True, read_only=True)
#
#     class Meta:
#         model = Work
#         fields = "__all__"










