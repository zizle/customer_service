import datetime
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import OrganizationSerializer, CooperationSerializer
from .models import Organization, Cooperation
from users.models import Support
from users.serializers import SupportSerializer
from utils.create_notices import create_notice


class OrganizationListView(ListAPIView):
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.filter(is_active=True)
    pagination_class = None


class CreateOrganizationView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    # def post(self, request, *args, **kwargs):
    #     print(request.data)
    #     print(request.data)
    #     print(request.data)
    #     print(request.data)
    #     return self.create(self, request, *args, **kwargs)


class DeleteOrganization(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, oid):
        try:
            organization = Organization.objects.get(id=oid)
            organization.is_active = False
            organization.save()
        except Exception as e:
            return Response({"data": "删除失败" + str(e), "status": "500"})
        else:
            return Response({"data": "删除成功", "status": "204"})


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
        receiver = None
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
            work.save()
            # 创建消息
            create_notice(
                type=3,
                sender=request.user,
                receiver=work.sponsor,
                content=message,
                status=False
            )
        except Exception as e:
            return Response({"message": "操作失败save fail", "status": "204"})
        return Response({"message": "操作成功", "status": "205"})






