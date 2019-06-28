import datetime
from django.db import transaction
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import OrganizationSerializer, CooperationSerializer
from .models import Organization, Cooperation
from users.models import Support, User
from users.serializers import SupportSerializer
from utils.create_notices import create_notice


class OrganizationListView(ListAPIView):
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.filter(is_active=True)
    pagination_class = None


class CreateOrganizationView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def post(self, request, *args, **kwargs):
        print(request.data)
        user = request.user
        name = request.data.get("name")
        try:
            uid = int(request.data.get("user"))
        except Exception as e:
            return Response({"status": status.HTTP_400_BAD_REQUEST, "message": "指定负责人有误" + str(e)})
        if user.level > 1:
            return Response({"status": 403, "message": "没有权限创建部门!", "data": ""})
        # 查询要创建的部门存在直接更新,并且设置相应的leader
        organization = Organization.objects.filter(name=name)
        if organization:
            with transaction.atomic():
                # 修改部门
                organization.update(is_active = True)
                # 设置user
                user = User.objects.filter(id=uid)
                user.update(
                organization=organization.first(),
                leader=True)
                # 所有的子user都为这个部门
                user.first().level=2
                user.first().save()
                self.update_sub_user(user=user.first(), organization=organization.first())
                # 序列化
                serializer = OrganizationSerializer(instance=organization.first())
                headers = self.get_success_headers(serializer.data)
                data = serializer.data
                data["message"] = "创建成功!"
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            data = serializer.data
            data["message"] = "创建成功!"
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def update_sub_user(self, user, organization):
        subs = user.subs.all()
        if not subs:
            return
        for sub in subs:
            sub.organization=organization
            sub.save()
            self.update_sub_user(sub, organization)


class DeleteOrganization(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, oid):
        user = request.user
        if user.level > 1:
            return Response({"data": "删除失败", "status": 403, "message": "您没有权限删除部门!"})
        with transaction.atomic():
            try:
                organization = Organization.objects.get(id=oid)
                organization.is_active = False
                organization.save()
                # user更新为最近一级父级用户的organization
                # for user in organization.users.all():
                #     self.update_user_organization(modify_user=user, user=user)
                organization.users.update(organization=None, leader=False, level=4)
            except Exception as e:
                return Response({"message": "删除失败" + str(e), "status": 500})
            else:
                return Response({"message": "删除成功", "status": 204})

    # def update_user_organization(self, modify_user, user):
    #     parent = user.parent
    #     if not parent:
    #         modify_user.organization = None
    #         modify_user.leader = False
    #         modify_user.level = 4
    #         modify_user.save()
    #         return
    #     if parent.organization:
    #         modify_user.organization = parent.organization
    #         modify_user.leader = False
    #         modify_user.level = 4
    #         modify_user.save()
    #         return
    #     self.update_user_organization(modify_user=modify_user, user=parent)


class CreateCooperationView(CreateAPIView):
    serializer_class = CooperationSerializer


class OrganizationWorkListView(APIView):
    permission_classes = [IsAuthenticated]
    user_sets = []

    def get(self, request):
        support_events = []
        user = request.user

        self.user_sets.clear()
        self.get_users(user)  # 获取所有的子下级
        # 遍历子下级，获取全部的支持事项
        for sub in self.user_sets:
            support_events += Support.objects.filter(sponsor=sub).all()
        supporter = SupportSerializer(instance=support_events, many=True)

        cooperater = None
        if user.leader:
            cooperate_events = Cooperation.objects.filter(organization=user.organization)
            cooperater = CooperationSerializer(instance=cooperate_events, many=True)

        return Response({"supports": supporter.data, "cooperations": cooperater.data if cooperater else []})

    def get_users(self, user):
        subs = user.subs.filter(is_active=True)
        if not subs:
            return
        for sub in subs:
            self.user_sets.append(sub)
            self.get_users(sub)


class UpdateOrganizationWork(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, wid):
        QueryModel = None
        message = ''
        classify = request.data.get("classify")
        action = request.data.get("action")
        authorize = request.data.get("authorize")
        if classify == "cooperation":
            QueryModel = Cooperation
            message += "部门协作``"
        if classify == "support":
            QueryModel = Support
            message += "上级支持``"
        if not QueryModel:
            return Response({"message": "操作错误has no QueryModel", "status": "403"})
        try:
            work = QueryModel.objects.get(id=wid)
            if work.status != 0:
                return Response({"message": "此问题您已经处理过了has done", "status": "204"})
            if action == "pass":
                work.status = 1
                message += work.content + "``已经通过"
            if action == "reject":
                work.status = -1
                message += work.content + "``已被驳回"
            if authorize and action == "pass":  # 授权信息修改
                customer = work.customer
                # 当前时间
                now = datetime.datetime.now()
                customer.update_time = now
                customer.save()
                message += ",请于24小时内完成修改操作。"
            work.handler = self.request.user
            work.save()
            # 创建消息
            create_notice(
                type=3,
                sender=request.user,
                receiver=work.sponsor,
                content=message
            )
        except Exception as e:
            return Response({"message": "操作失败save fail", "status": "204"})
        return Response({"message": "操作成功", "status": "205"})






