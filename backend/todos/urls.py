from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, TodoStatsView

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')

urlpatterns = [
    path('', include(router.urls)),
    path('todos/stats/summary/', TodoStatsView.as_view(), name='todo-stats'),
]
