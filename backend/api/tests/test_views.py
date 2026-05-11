from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import User, MeetingRoom, Reservation


class ViewTests(APITestCase):
    """Тестирование API эндпоинтов и прав доступа."""

    def setUp(self):
        """Инициализация пользователей и комнат для API тестов."""
        self.user = User.objects.create_user(
            username='dima',
            password='password123',
            email='dima@example.com'
        )
        self.user2 = User.objects.create_user(
            username='other',
            password='password123',
            email='other@example.com'
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

    def test_unauthenticated_cannot_create_reservation(self):
        """Запрет на создание брони без авторизации."""
        url = reverse('reservation-list')
        start = timezone.now() + timedelta(days=1)
        data = {
            'room': self.room.id,
            'start_at': start,
            'end_at': start + timedelta(hours=1)
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

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

    def test_users_see_only_their_reservations(self):
        """Обычные пользователи видят только свои бронирования."""
        start = timezone.now() + timedelta(days=1)
        Reservation.objects.create(
            client=self.user, room=self.room,
            start_at=start, end_at=start + timedelta(hours=1)
        )
        Reservation.objects.create(
            client=self.user2, room=self.room,
            start_at=start + timedelta(hours=2), end_at=start + timedelta(hours=3)
        )

        self.client.force_authenticate(user=self.user)
        url = reverse('reservation-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['client_info']['username'], 'dima')

    def test_bookings_action_requires_date(self):
        """Проверка работы кастомного действия bookings без даты."""
        url = reverse('meetingroom-bookings', kwargs={'pk': self.room.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bookings_action_with_valid_date(self):
        """Проверка успешного получения занятых слотов по дате."""
        target_date = (timezone.now() + timedelta(days=5))
        Reservation.objects.create(
            client=self.user, room=self.room,
            start_at=target_date, end_at=target_date + timedelta(hours=1)
        )
        url = reverse('meetingroom-bookings', kwargs={'pk': self.room.id})
        response = self.client.get(url, {'date': target_date.strftime('%Y-%m-%d')})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_can_update_own_reservation(self):
        """Проверка права пользователя на изменение своей брони."""
        start = timezone.now() + timedelta(days=2)
        res = Reservation.objects.create(
            client=self.user, room=self.room,
            start_at=start, end_at=start + timedelta(hours=1)
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('reservation-detail', kwargs={'pk': res.id})
        response = self.client.patch(url, {'note': 'Новая цель встречи'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Reservation.objects.get(id=res.id).note, 'Новая цель встречи')

    def test_user_cannot_update_others_reservation(self):
        """Проверка запрета на редактирование чужих бронирований."""
        start = timezone.now() + timedelta(days=2)
        res = Reservation.objects.create(
            client=self.user2, room=self.room,
            start_at=start, end_at=start + timedelta(hours=1)
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('reservation-detail', kwargs={'pk': res.id})
        response = self.client.patch(url, {'note': 'Взлом'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_delete_own_reservation(self):
        """Проверка права пользователя на удаление (отмену) своей брони."""
        start = timezone.now() + timedelta(days=3)
        res = Reservation.objects.create(
            client=self.user, room=self.room,
            start_at=start, end_at=start + timedelta(hours=1)
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('reservation-detail', kwargs={'pk': res.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Reservation.objects.count(), 0)
