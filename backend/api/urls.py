"""Конфигурация маршрутов (URL) для API приложения."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MeetingRoomViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r'rooms', MeetingRoomViewSet, basename='meetingroom')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]
