import os
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

from . import database

# Create your views here.

def index(request):
    return render(request, 'website/index.html', {
    })
