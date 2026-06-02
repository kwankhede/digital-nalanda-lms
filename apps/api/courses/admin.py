from django.contrib import admin

from .models import Category, Course, Lesson, Module


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    prepopulated_fields = {"slug": ("title",)}


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "level", "language", "is_free", "is_published")
    list_filter = ("level", "language", "is_free", "is_published", "category")
    search_fields = ("title", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order")
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "module", "lesson_type", "order", "is_preview", "is_published")
    list_filter = ("lesson_type", "is_preview", "is_published")
    prepopulated_fields = {"slug": ("title",)}
