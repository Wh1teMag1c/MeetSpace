from datetime import timedelta

from api.models import User, MeetingRoom, Reservation
from django.test import TestCase
from django.utils import timezone


class ModelTests(TestCase):
    """Тестирование базовой логики моделей и строковых представлений."""

    def setUp(self):
        """Создание базовых данных для тестирования моделей."""
        self.user = User.objects.create_user(
            username='tester',
            password='password',
            email='tester@example.com'
        )
        self.room = MeetingRoom.objects.create(
            title='Room 1',
            room_type='small',
            location='Floor 1',
            max_capacity=5
        )

    def test_meeting_room_str(self):
        """Проверка строкового представления комнаты."""
        self.assertEqual(str(self.room), "Room 1 (Этаж 1)")

    def test_reservation_str(self):
        """Проверка строкового представления бронирования."""
        res = Reservation.objects.create(
            client=self.user,
            room=self.room,
            start_at=timezone.now(),
            end_at=timezone.now() + timedelta(hours=1)
        )
        self.assertEqual(str(res), f"Бронь {res.id}: Room 1")
