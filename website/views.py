import os
import jsonpickle
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

from . import database
from . import menu
from .menu import Menu
from . import quotes

# Create your views here.

def index(request):
    hostname = os.getenv('HOSTNAME', 'unknown')

    return render(request, 'website/index.html', {
        'hostname': hostname,
        'database': database.info(),
        'menu': menu.defaultmenu
    })

def quote(request):
	return HttpResponse(jsonpickle.encode(quotes.random_quote(), unpicklable=False), content_type="application/json")

def quotes_page(request):
	return render(request, 'website/quotes.html', {
		'menu': menu.defaultmenu,
		'quotes': quotes.quotes
	})

def about(request):
	return render(request, 'website/about.html', {
		'menu': menu.defaultmenu
	})

def handheld(request):
	return render(request, 'website/handheld.html', {
		'menu': menu.defaultmenu,
		'menuhidden': [ value for (key, value) in 
			{
			'handheld/': Menu("handheld/", "Handheld&nbsp;Links"),
			'nds/': Menu("nds/", "NDS&nbsp;Links"),
			'psp/': Menu("psp/", "PSP&nbsp;Links")
			}.items()
			if key == request.path_info
		]
	})

def links(request):
	return render(request, 'website/links.html', {
		'menu': menu.defaultmenu
	})