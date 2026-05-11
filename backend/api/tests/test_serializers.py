from datetime import timedelta

from api.models import User, MeetingRoom, Reservation
from api.serializers import ReservationSerializer
from django.test import TestCase
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class SerializerTests(TestCase):
    """Тестирование логики валидации бронирований в сериализаторе."""

    def setUp(self):
        """Подготовка данных для тестирования валидации."""
        self.user = User.objects.create_user(
            username='user1',
            password='pass',
            email='user1@example.com'
        )
        self.room = MeetingRoom.objects.create(title='Piter', max_capacity=10)

    def test_end_before_start_fails(self):
        """Проверка запрета на окончание брони раньше начала."""
        start = timezone.now() + timedelta(hours=2)
        end = timezone.now() + timedelta(hours=1)
        data = {'room': self.room.id, 'start_at': start, 'end_at': end}
        serializer = ReservationSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)

    def test_past_date_fails(self):
        """Проверка запрета на бронирование в прошлом."""
        start = timezone.now() - timedelta(hours=2)
        end = timezone.now() - timedelta(hours=1)
        data = {'room': self.room.id, 'start_at': start, 'end_at': end}
        serializer = ReservationSerializer(data=data)
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)
