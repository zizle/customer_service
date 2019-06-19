import re
import datetime
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView,  ListAPIView, RetrieveAPIView
from rest_framework.response import Response

from .serializers import CreateUserSerializer, UsersSerializer, UserSerializer, ListUserSerializer, SupportSerializer
from users.models import User


class CreateUserView(CreateAPIView):
    """创建用户"""
    permission_classes = [IsAuthenticated]
    serializer_class = CreateUserSerializer

    def post(self, request, *args, **kwargs):
        # 生成用户名
        user = request.user
        max_id = User.objects.latest().id
        username = "rdqh" + "%04d" % (max_id + 1)
        # 添加字段值
        request.data["username"] = username
        request.data["parent"] = user.id

        request.data["organization"] = user.organization.id if user.organization else user.organization

        return self.create(request, *args, **kwargs)


class RetrieveUserView(APIView):
    total_customer_count = 0

    def get(self, request, pk):
        try:
            user_id = int(pk)
        except Exception as e:
            return Response({"data": "参数错误"})
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(instance=user)
        data = serializer.data
        # 查询用户的小组人数
        group_count = user.subs.filter(is_active=True).count()
        customer_count = user.customers.filter(delete=False).count()
        self.total_customer_count += customer_count  # 先加本账户客户数
        self.get_customers_count(user)  # 再加子孙账户客户数
        data["group_count"] = group_count + 1  # 包含自己
        data["customer_count"] = customer_count
        data["total_customer_count"] = self.total_customer_count

        return Response(data)

    def get_customers_count(self, user):
        subs = user.subs.all()
        if not subs:
            return
        for user in subs:
            self.total_customer_count += user.customers.filter(delete=False).count()
            self.get_customers_count(user)


class UserBackend(ModelBackend):
    """自定义登录认证"""
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(Q(username=username) | Q(mobile=username) | Q(email=username))
            if user.check_password(password) or password == user.password:
                # 保存上次的登录时间
                user.pre_login = user.last_login
                # 修改登录时间
                user.last_login = datetime.datetime.now()
                user.save()
                return user
            else:
                return None
        except Exception as e:
            return None


class ModifyPasswordView(APIView):
    """修改密码"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user  # user对象
        old = request.data.get("old")
        new = request.data.get("new")
        new_again = request.data.get("newAgain")
        message = u"修改成功"
        if old == new:
            message = u"新密码和旧密码一样"
            return Response({"active": False, "message": message})
        if new != new_again:
            message = u"两次输入的密码不一致"
            return Response({"active": False, "message": message})
        if not re.match("^[a-zA-Z0-9!@#$%^&*?]{6,20}$", new):
            message = u"密码为6-20位，由数字、字母及!@#$%^&*?字符组成"
            return Response({"active": False, "message": message})
        # 检查旧密码是否正确
        if not user.check_password(old):
            if user.password != old:
                message = "请输入正确的旧密码"
                return Response({"active": False, "message": message})
        try:
            user.set_password(new)
            user.save()
        except Exception as e:
            message = str(e)
            return Response({"active": False, "message": message})
        data = {
            "active": True,
            "message": message
        }
        return Response(data)


class UpdateUserView(APIView):
    def put(self, request):
        user = request.user
        try:
            data = request.data
            serializer = UserSerializer()
            new = serializer.update(user, data)
            new.save()
        except Exception as e:
            return Response({"data": "修改出错"})
        else:
            return Response({"data": "修改信息成功"})


class SubUserListView(ListAPIView):
    serializer_class = ListUserSerializer
    user_sets = []

    def get_queryset(self):
        user = self.request.user
        self.user_sets.clear()
        self.get_users(user)
        return self.user_sets

    def get_users(self, user):
        subs = user.subs.filter(is_active=True)
        if not subs:
            return
        for sub in subs:
            self.user_sets.append(sub)
            self.get_users(sub)


class UsersView(ListAPIView):
    """本用户的所有子用户"""
    serializer_class = UsersSerializer
    pagination_class = None
    user_sets = []

    def get_queryset(self):
        user = self.request.user
        self.user_sets.clear()
        self.get_users(user)
        # 过滤掉是leader的user在返回
        return [user for user in self.user_sets if not user.leader]

    def get_users(self, user):
        subs = user.subs.filter(is_active=True)
        if not subs:
            return
        for sub in subs:
            self.user_sets.append(sub)
            self.get_users(sub)


class UserGroupView(APIView):
    """员工报表接口"""
    permission_classes = [IsAuthenticated]
    user_sets = []

    def get(self, request, pk):
        sub_set = []
        try:
            uid = int(pk)
        except Exception as e:
            return Response({"message": "请求错误", "status": 403})
        user = User.objects.get(id=uid)
        self.user_sets.clear()
        self.get_subs(user)
        for sub in self.user_sets:
            serializer = UserSerializer(instance=sub)
            data = serializer.data
            # 查询用户的客户量
            customer_count = sub.customers.count()
            if sub.parent:
                parent = sub.parent.real_name if sub.parent.real_name else sub.parent.username
            else:
                parent = None
            data["customer_count"] = customer_count
            data["parent"] = parent
            sub_set.append(data)
        return Response({"data": sub_set, "message": "查询成功", "status": "200"})

    def get_subs(self, user):
        subs = user.subs.filter(is_active=True)
        if not subs:
            return
        for sub in subs:
            self.user_sets.append(sub)
            self.get_subs(sub)


class GetUserLeaderView(APIView):
    def get(self, request):
        user = request.user
        if not user:
            return Response({"message": "登录信息有误", "status": 403,"leader": ''})
        leader_obj = user.parent
        leader = leader_obj.real_name if leader_obj.real_name else leader_obj.username
        return Response({"message": "查询成功", "status": 200, "leader": leader})


class CreateSupportView(CreateAPIView):
    serializer_class = SupportSerializer











