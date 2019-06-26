# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
import time
import os
from rest_framework import serializers
from django.conf import settings
from .models import Customer
from kinds.models import Kind


class CustomerSerializer(serializers.ModelSerializer):
    create_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    update_time = serializers.DateTimeField(format('%Y-%m-%d %H:%M:%S'), read_only=True)
    belong = serializers.SlugRelatedField(slug_field="real_name", read_only=True)
    card = serializers.CharField(read_only=True)
    variety = serializers.SerializerMethodField(method_name=None)

    class Meta:
        model = Customer
        fields = '__all__'

    def get_variety(self, obj):
        # 将品种id型字段转为名称
        variety_name = []
        for kind_id in obj.variety.split(","):
            variety_name.append(Kind.objects.get(id=int(kind_id)).name)
        return ','.join(variety_name) + ","


    def create(self, validated_data):
        # 品种转为id存储
        validated_data = self.variety_to_ids(validated_data)
        validated_data["belong"] = self.context["request"].user
        self.save_card(validated_data)
        customer = super().create(validated_data)
        return customer

    def update(self, instance, validated_data):
        # 添加被验证去掉的variety字段
        request = self.context["request"]
        validated_data["variety"] = request.data.get("variety")
        validated_data = self.variety_to_ids(validated_data)
        self.save_card(validated_data)
        super().update(instance, validated_data)
        return instance

    @staticmethod
    def variety_to_ids(validated_data):
        """将品种转为id"""
        variety_ids = []
        # 去除最后的','并转为列表
        variety_list = validated_data["variety"][:-1].split(",")
        for variety_name in variety_list:
            kind_id = Kind.objects.get(name=variety_name).id
            variety_ids.append(str(kind_id))
        validated_data["variety"] = ",".join(variety_ids)
        return validated_data

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

