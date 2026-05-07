from rest_framework import viewsets, permissions
from .models import MeetingRoom, Reservation
from .serializers import MeetingRoomSerializer, ReservationSerializer

class MeetingRoomViewSet(viewsets.ModelViewSet):
    queryset = MeetingRoom.objects.filter(is_active=True)
    serializer_class = MeetingRoomSerializer
    permission_classes = [permissions.AllowAny]

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.all()
        if user.is_authenticated:
            return Reservation.objects.filter(client=user)
        return Reservation.objects.none()