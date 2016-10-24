from django.conf.urls import include, url
from django.contrib import admin

from welcome.views import health
from website.views import index, quote, quotes_page, about, handheld, links

urlpatterns = [
    # Examples:
    # url(r'^$', 'project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^health$', health),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^handheld/$', handheld),
    url(r'^nds/$', handheld),
    url(r'^psp/$', handheld),
    url(r'^quotes/$', quotes_page),
    url(r'^quote/$', quote),
    url(r'^about/$', about),
    url(r'^links/$', links),
    url(r'^$', index),
]
