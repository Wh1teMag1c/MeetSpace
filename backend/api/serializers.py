from django.utils import timezone
from rest_framework import serializers

from .models import MeetingRoom, Reservation, User


class UserShortSerializer(serializers.ModelSerializer):
    """Сериализатор для краткой информации о пользователе"""

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class MeetingRoomSerializer(serializers.ModelSerializer):
    """Сериализатор для переговорных комнат"""

    class Meta:
        model = MeetingRoom
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    """Сериализатор для бронирований с проверкой пересечений по времени"""
    room_details = MeetingRoomSerializer(source='room', read_only=True)
    client_info = UserShortSerializer(source='client', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'client', 'client_info', 'room', 'room_details', 'start_at', 'end_at', 'status', 'note']
        extra_kwargs = {'client': {'required': False}}

    def validate(self, data):
        if data['start_at'] >= data['end_at']:
            raise serializers.ValidationError("Время окончания должно быть позже времени начала.")

        if data['start_at'] < timezone.now():
            raise serializers.ValidationError("Нельзя забронировать время в прошлом.")
        overlap = Reservation.objects.filter(
            room=data['room'],
            start_at__lt=data['end_at'],
            end_at__gt=data['start_at']
        ).exclude(status='canceled')

        if overlap.exists():
            raise serializers.ValidationError("К сожалению, эта комната уже занята на выбранный интервал.")

        return data
