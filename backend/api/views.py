from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MeetingRoom, Reservation
from .serializers import MeetingRoomSerializer, ReservationSerializer


class MeetingRoomViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingRoomSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return MeetingRoom.objects.all()
        return MeetingRoom.objects.filter(is_active=True)

    @action(detail=True, methods=['get'])
    def bookings(self, request, pk=None):
        date_param = request.query_params.get('date')
        if not date_param:
            return Response(
                {"error": "Параметр date обязателен (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        bookings = Reservation.objects.filter(
            room_id=pk,
            start_at__date=date_param
        ).exclude(status='canceled')

        serializer = ReservationSerializer(bookings, many=True)
        return Response(serializer.data)


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.all().order_by('-start_at')
        return Reservation.objects.filter(client=user).order_by('-start_at')
