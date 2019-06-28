from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.filters import OrderingFilter

from .serializers import WorkSerializer, ReplyWorkSerializer, CreateSubReplySerializer
from .models import Work, ReplyWork


class WorkViewSet(ModelViewSet):
    serializer_class = WorkSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = ("update_time",)

    def get_queryset(self):  # GET Retrieve方法url: ^works/(?P<pk>[^/.]+)/?cs=(?P<pk>[^/.]+)$)
        try:
            customer_id = int(self.request.query_params["cs"])
        except Exception as e:
            return None
        else:
            return Work.objects.filter(customer=customer_id)

    def update(self, request, *args, **kwargs):
        return Response({"message": "暂时不支持修改"})


class ReplyWorkViewSet(ModelViewSet):
    serializer_class = ReplyWorkSerializer
    pagination_class = None

    def get_queryset(self):
        try:
            work_id = int(self.request.query_params["wk"])
        except Exception as e:
            return None
        else:
            return ReplyWork.objects.filter(work=work_id)


class CreateSubReplyView(CreateAPIView):
    serializer_class = CreateSubReplySerializer







