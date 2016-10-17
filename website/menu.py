
class Menu:
	def __init__(self, url, name, *submenu):
		self.url = url
		self.name = name
		if submenu is not None:
			self.submenu = submenu

defaultmenu = [
	Menu("", "Home"),
	Menu("links/", "Links"),
	Menu("static/Resume.pdf", "R&eacute;sume&eacute;"),
	Menu("thesis/", "Thesis"),
	Menu("projects/", "Projects",
		Menu("projects/scripts", "Scripts"),
		Menu("userscripts/", "Userscripts"),
		),
	Menu("travel/" "Travel and Photos",
		Menu("http://www.flickr.com/photos/finaldoom/", "Flickr"),
		Menu("http://finaldoom.tumblr.com/", "Tumblr"),
		),
	Menu("quotes/", "Quotes"),
	Menu("about/", "About&nbsp;Me"),
]