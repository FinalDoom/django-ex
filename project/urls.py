from django.conf.urls import include, url
from django.contrib import admin

from welcome.views import index, health
from website.views import index as webindex, quote, quotes_page, about, handheld, links

urlpatterns = [
    # Examples:
    # url(r'^$', 'project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', index),
    url(r'^health$', health),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^website/handheld/$', handheld),
    url(r'^website/nds/$', handheld),
    url(r'^website/psp/$', handheld),
    url(r'^website/quotes/$', quotes_page),
    url(r'^website/quote/$', quote),
    url(r'^website/about/$', about),
    url(r'^website/links/$', links),
    url(r'^website/$', webindex),
]
