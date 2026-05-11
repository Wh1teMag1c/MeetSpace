"""Скрипт для массового заполнения базы данных реалистичными тестовыми данными."""
import random
from datetime import timedelta

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import User, MeetingRoom, Reservation


class Command(BaseCommand):
    """Генератор данных для стресс-тестирования интерфейса и презентации."""
    help = 'Заполняет БД начальными данными: пользователи, комнаты (с загрузкой фото) и бронирования'

    def handle(self, *args, **options):
        """Основная логика создания тестовых данных."""
        self.stdout.write('Начало генерации данных...')

        test_users_data = [
            {'username': 'ivan_dev', 'email': 'ivan@example.com', 'first': 'Иван', 'last': 'Иванов'},
            {'username': 'anna_qa', 'email': 'anna@example.com', 'first': 'Анна', 'last': 'Смирнова'},
            {'username': 'alex_pm', 'email': 'alex@example.com', 'first': 'Алексей', 'last': 'Петров'},
        ]

        users = []
        for u_data in test_users_data:
            user, created = User.objects.get_or_create(
                username=u_data['username'],
                defaults={
                    'email': u_data['email'],
                    'first_name': u_data['first'],
                    'last_name': u_data['last']
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)

        self.stdout.write(self.style.SUCCESS(f'Пользователи готовы: {len(users)} шт.'))

        rooms_data = [
            {
                "title": "Переговорная «Малевич»",
                "room_type": "small",
                "location": "Москва, Пресненская наб., 12 (БЦ Федерация)",
                "level": 45,
                "max_capacity": 4,
                "has_tv": True,
                "has_whiteboard": True,
                "has_projector": False,
                "info": "Уютная комната для 1-1 встреч и видеозвонков. Отличная звукоизоляция. Пожалуйста, не выносите пульты от ТВ.",
                "image_url": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Конференц-зал «Орбита»",
                "room_type": "conf",
                "location": "Москва, ул. Лесная, 5 (БЦ Белая Площадь)",
                "level": 12,
                "max_capacity": 25,
                "has_tv": False,
                "has_whiteboard": True,
                "has_projector": True,
                "info": "Просторный зал для проведения масштабных презентаций и собраний. Имеется кулер с питьевой водой и кофемашина.",
                "image_url": "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Open Space «Нева»",
                "room_type": "open",
                "location": "Санкт-Петербург, Дегтярный пер., 11 (БЦ Невская Ратуша)",
                "level": 3,
                "max_capacity": 15,
                "has_tv": True,
                "has_whiteboard": True,
                "has_projector": False,
                "info": "Открытая креативная зона с мягкими пуфами. Идеально для брейнштормов. Просьба соблюдать комфортный уровень шума для соседних команд.",
                "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Переговорная «Зилант»",
                "room_type": "small",
                "location": "Казань, ул. Петербургская, 52 (ИТ-парк)",
                "level": 5,
                "max_capacity": 6,
                "has_tv": True,
                "has_whiteboard": True,
                "has_projector": False,
                "info": "Строгий дизайн и много естественного света. Запасные маркеры лежат в нижнем ящике тумбы.",
                "image_url": "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&q=80&w=1000"
            },
            {
                "title": "Зал «Аврора»",
                "room_type": "conf",
                "location": "Москва, Большой бульвар, 42 (ИЦ Сколково)",
                "level": 2,
                "max_capacity": 50,
                "has_tv": True,
                "has_whiteboard": False,
                "has_projector": True,
                "info": "Большой лекторий с амфитеатром. Микрофоны и кликеры выдаются на главном ресепшене под роспись.",
                "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000"
            }
        ]

        self.stdout.write('Загрузка комнат и скачивание изображений...')
        rooms = []
        for data in rooms_data:
            image_url = data.pop('image_url')

            room, created = MeetingRoom.objects.get_or_create(
                title=data['title'],
                defaults=data
            )

            if (created or not room.preview) and image_url:
                try:
                    response = requests.get(image_url, timeout=10)
                    if response.status_code == 200:
                        file_name = f"room_{room.id}.jpg"
                        room.preview.save(file_name, ContentFile(response.content), save=True)
                        self.stdout.write(f"  [+] Скачано фото для: {room.title}")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  [-] Ошибка загрузки фото для {room.title}: {e}"))

            rooms.append(room)

        self.stdout.write('Распределение встреч по календарю...')
        Reservation.objects.exclude(status='canceled').delete()

        notes = [
            "Синхронизация команды", "Собеседование с кандидатом",
            "Презентация заказчику", "Планирование спринта",
            "Встреча один на один", "Мозговой штурм"
        ]

        base_time = timezone.now().replace(minute=0, second=0, microsecond=0)
        reservations_created = 0

        for day_offset in range(4):
            current_day = base_time + timedelta(days=day_offset)

            for room in rooms:
                num_meetings = random.randint(2, 3)
                busy_hours = set()

                for _ in range(num_meetings):
                    hour = random.randint(9, 17)
                    if hour in busy_hours or (hour + 1) in busy_hours:
                        continue

                    busy_hours.add(hour)
                    start_at = current_day.replace(hour=hour)
                    end_at = start_at + timedelta(hours=random.choice([1, 2]))

                    Reservation.objects.create(
                        client=random.choice(users),
                        room=room,
                        start_at=start_at,
                        end_at=end_at,
                        status='confirmed',
                        note=random.choice(notes)
                    )
                    reservations_created += 1

        self.stdout.write(self.style.SUCCESS('Все данные загружены!'))
