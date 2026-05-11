from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from api.models import User, MeetingRoom, Reservation
from api.serializers import ReservationSerializer


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
        self.base_time = timezone.now() + timedelta(days=1)

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

    def test_overlapping_reservation_fails(self):
        """Проверка защиты от пересечения времени бронирований."""
        Reservation.objects.create(
            client=self.user,
            room=self.room,
            start_at=self.base_time,
            end_at=self.base_time + timedelta(hours=2)
        )
        data = {
            'room': self.room.id,
            'start_at': self.base_time + timedelta(minutes=30),
            'end_at': self.base_time + timedelta(hours=1, minutes=30)
        }
        serializer = ReservationSerializer(data=data)
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertIn('занято', str(context.exception))

    def test_valid_reservation_passes(self):
        """Проверка успешной валидации корректных данных."""
        data = {
            'room': self.room.id,
            'start_at': self.base_time,
            'end_at': self.base_time + timedelta(hours=1)
        }
        serializer = ReservationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_adjacent_reservations_allowed(self):
        """Проверка разрешения бронирования встык (конец одной = начало другой)."""
        Reservation.objects.create(
            client=self.user, room=self.room,
            start_at=self.base_time, end_at=self.base_time + timedelta(hours=1)
        )
        data = {
            'room': self.room.id,
            'start_at': self.base_time + timedelta(hours=1),
            'end_at': self.base_time + timedelta(hours=2)
        }
        serializer = ReservationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_canceled_reservation_ignores_overlap(self):
        """Проверка, что отмененная бронь не блокирует время для новых."""
        Reservation.objects.create(
            client=self.user, room=self.room, status='canceled',
            start_at=self.base_time, end_at=self.base_time + timedelta(hours=1)
        )
        data = {
            'room': self.room.id,
            'start_at': self.base_time,
            'end_at': self.base_time + timedelta(hours=1)
        }
        serializer = ReservationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
