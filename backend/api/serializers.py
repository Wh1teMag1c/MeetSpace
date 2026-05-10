from django.contrib.auth import get_user_model
from django.utils import timezone
from djoser.serializers import UserSerializer as BaseUserSerializer
from rest_framework import serializers

from .models import MeetingRoom, Reservation, User

UserModel = get_user_model()


class CustomUserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = UserModel
        fields = (
            'id', 'username', 'email', 'first_name',
            'last_name', 'phone', 'avatar', 'bio', 'is_staff'
        )


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class MeetingRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingRoom
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    room_details = MeetingRoomSerializer(source='room', read_only=True)
    client_info = UserShortSerializer(source='client', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'client', 'client_info', 'room', 'room_details',
            'start_at', 'end_at', 'status', 'note'
        ]
        extra_kwargs = {'client': {'read_only': True}}

    def validate(self, data):
        start_at = data.get(
            'start_at', getattr(self.instance, 'start_at', None)
        )
        end_at = data.get('end_at', getattr(self.instance, 'end_at', None))
        room = data.get('room', getattr(self.instance, 'room', None))
        status_val = data.get(
            'status', getattr(self.instance, 'status', 'new')
        )

        if start_at and end_at:
            if start_at >= end_at:
                raise serializers.ValidationError(
                    "Время окончания должно быть позже начала."
                )

            if 'start_at' in data:
                is_changed = (
                        not self.instance or self.instance.start_at != start_at
                )
                if is_changed and start_at < timezone.now():
                    raise serializers.ValidationError(
                        "Нельзя забронировать время в прошлом."
                    )

        if status_val != 'canceled' and room and start_at and end_at:
            overlap = Reservation.objects.filter(
                room=room,
                start_at__lt=end_at,
                end_at__gt=start_at
            ).exclude(status='canceled')

            if self.instance:
                overlap = overlap.exclude(pk=self.instance.pk)

            if overlap.exists():
                raise serializers.ValidationError(
                    "К сожалению, это время уже занято."
                )

        return data
