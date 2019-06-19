from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import KindSerializer
from .models import Kind


# class KindsListView(ListAPIView):
#
#     serializer_class = KindSerializer
#     queryset = Kind.objects.all()


class KindsListView(APIView):
    def get(self,request):
        try:
            kinds = Kind.objects.all()
        except Exception as e:
            return Response({})
        serializer = KindSerializer(instance=kinds, many=True)
        return Response(serializer.data)