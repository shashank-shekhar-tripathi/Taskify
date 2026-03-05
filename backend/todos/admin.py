from django.contrib import admin
from .models import Todo

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'category', 'completed', 'due_date', 'created_at')
    list_filter = ('completed', 'priority', 'category')
    search_fields = ('title', 'user__username')
