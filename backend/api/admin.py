from django.contrib import admin

from .models import User, MeetingRoom, Reservation


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email')


@admin.register(MeetingRoom)
class MeetingRoomAdmin(admin.ModelAdmin):
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
    list_display = ('id', 'room', 'client', 'start_at', 'end_at', 'status')
    list_filter = ('status', 'start_at')
    search_fields = ('room__title', 'client__username')
    date_hierarchy = 'start_at'
