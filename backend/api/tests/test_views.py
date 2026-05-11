from datetime import timedelta

from api.models import User, MeetingRoom, Reservation
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase


class ViewTests(APITestCase):
    """Тестирование API эндпоинтов и прав доступа."""

    def setUp(self):
        """Инициализация пользователей и комнат для API тестов."""
        self.user = User.objects.create_user(
            username='dima',
            password='password123',
            email='dima@example.com'
        )
        self.staff = User.objects.create_user(
            username='admin',
            password='admin',
            is_staff=True,
            email='admin@example.com'
        )
        self.room = MeetingRoom.objects.create(
            title='Moscow',
            is_active=True,
            max_capacity=10
        )
        self.inactive_room = MeetingRoom.objects.create(
            title='Secret',
            is_active=False,
            max_capacity=5
        )

    def test_anonymous_sees_only_active_rooms(self):
        """Анонимный пользователь видит только активные комнаты."""
        url = reverse('meetingroom-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)

    def test_staff_sees_all_rooms(self):
        """Персонал видит все комнаты, включая неактивные."""
        self.client.force_authenticate(user=self.staff)
        url = reverse('meetingroom-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 2)

    def test_create_reservation_authenticated(self):
        """Авторизованный пользователь может создать бронь."""
        self.client.force_authenticate(user=self.user)
        url = reverse('reservation-list')
        start = timezone.now() + timedelta(days=1)
        data = {
            'room': self.room.id,
            'start_at': start,
            'end_at': start + timedelta(hours=1)
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_bookings_action_requires_date(self):
        """Проверка работы кастомного действия bookings."""
        url = reverse('meetingroom-bookings', kwargs={'pk': self.room.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
