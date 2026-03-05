from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from todos.views import RegisterView, LoginView

from django.http import HttpResponse

def home(request):
    return HttpResponse("Taskify Backend Running 🚀")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('todos.urls')),
]
