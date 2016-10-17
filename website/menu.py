# -*- coding: utf-8 -*-

import os
from django.utils.safestring import mark_safe

BASE_URL = "/" + os.path.split(os.path.dirname(__file__))[-1] + "/"

class Menu:
	def __init__(self, url, name, *submenu):
		if "://" in url:
			self.url = url
		else:
			self.url = BASE_URL + url
		self.name = mark_safe(name)
		if submenu is not None:
			self.submenu = submenu

defaultmenu = [
	Menu("", "Home"),
	Menu("links/", "Links"),
	Menu("static/Resume.pdf", "Résumé"),
	Menu("thesis/", "Thesis"),
	Menu("projects/", "Projects",
		Menu("projects/scripts", "Scripts"),
		Menu("userscripts/", "Userscripts"),
		),
	Menu("travel/", "Travel and Photos",
		Menu("http://www.flickr.com/photos/finaldoom/", "Flickr"),
		Menu("http://finaldoom.tumblr.com/", "Tumblr"),
		),
	Menu("quotes/", "Quotes"),
	Menu("about/", "About&nbsp;Me"),
]