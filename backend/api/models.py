from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name="Электронная почта")
    bio = models.TextField(max_length=500, blank=True, verbose_name="О себе")
    phone = models.CharField(
        max_length=15, blank=True, verbose_name="Контактный телефон"
    )
    avatar = models.URLField(
        max_length=500, blank=True, null=True, verbose_name="Ссылка на аватар"
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'


class MeetingRoom(models.Model):
    ROOM_TYPES = [
        ('conf', 'Конференц-зал'),
        ('small', 'Переговорная (малая)'),
        ('open', 'Open Space зона'),
    ]

    title = models.CharField(max_length=150, verbose_name="Название")
    room_type = models.CharField(
        max_length=10, choices=ROOM_TYPES, default='small', verbose_name="Тип"
    )
    location = models.CharField(max_length=255, verbose_name="Расположение")
    level = models.IntegerField(default=1, verbose_name="Этаж")
    max_capacity = models.PositiveIntegerField(
        verbose_name="Макс. количество мест"
    )

    has_tv = models.BooleanField(
        default=False, verbose_name="Наличие ТВ/Экрана"
    )
    has_whiteboard = models.BooleanField(
        default=False, verbose_name="Маркерная доска"
    )
    has_projector = models.BooleanField(
        default=False, verbose_name="Наличие проектора"
    )
    is_active = models.BooleanField(
        default=True, verbose_name="Доступна для брони"
    )

    preview = models.ImageField(
        upload_to='rooms_previews/', null=True, blank=True,
        verbose_name="Превью"
    )
    info = models.TextField(
        blank=True, verbose_name="Дополнительная информация"
    )

    def __str__(self):
        return f"{self.title} (Этаж {self.level})"

    class Meta:
        verbose_name = 'Переговорная комната'
        verbose_name_plural = 'Переговорные комнаты'


class Reservation(models.Model):
    RES_STATUS = [
        ('new', 'Новое'),
        ('confirmed', 'Подтверждено'),
        ('canceled', 'Отменено'),
    ]

    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='reservations',
        verbose_name="Заказчик"
    )
    room = models.ForeignKey(
        MeetingRoom, on_delete=models.CASCADE, related_name='reservations',
        verbose_name="Комната"
    )
    start_at = models.DateTimeField(verbose_name="Время начала")
    end_at = models.DateTimeField(verbose_name="Время окончания")

    status = models.CharField(
        max_length=10, choices=RES_STATUS, default='new', verbose_name="Статус"
    )
    note = models.TextField(blank=True, verbose_name="Цель бронирования")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Бронь {self.id}: {self.room.title}"

    class Meta:
        verbose_name = 'Бронирование'
        verbose_name_plural = 'Бронирования'
        ordering = ['-start_at']
