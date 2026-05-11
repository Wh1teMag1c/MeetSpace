"""Регистрация моделей приложения api в админ-панели Django."""
from django.contrib import admin

from .models import User, MeetingRoom, Reservation


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    """Интерфейс управления пользователями в админке."""
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email')


@admin.register(MeetingRoom)
class MeetingRoomAdmin(admin.ModelAdmin):
    """Интерфейс управления переговорными в админке."""
    list_display = (
        'title',
        'room_type',
        'location',
        'level',
        'max_capacity',
        'is_active',
    )
    list_filter = ('room_type', 'is_active', 'level')
    search_fields = ('title', 'location')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    """Интерфейс управления бронированиями в админке."""
    list_display = ('id', 'room', 'client', 'start_at', 'end_at', 'status')
    list_filter = ('status', 'start_at')
    search_fields = ('room__title', 'client__username')
    date_hierarchy = 'start_at'
