class Quote:
	def __init__(self, quote, speaker, title=None):
		self.quote = quote
		self.speaker = speaker
		self.title = title

quotes = [
	Quote("We all love each other the way we want to be loved, and we all accept the love we think we deserve.",
		'Charlie',
		'The Perks of Being a Wallflower' ),
	Quote("The brick walls are there for a reason. The brick walls are not there to keep us out. The brick walls are there to give us a chance to show how badly we want something. Because the brick walls are there to stop the people who don't want it badly enough. They're there to stop the other people.",
		'Randy Pausch',
   		'The Last Lecture' ),
	Quote("If you've done something right, people won't be sure you have done anything at all.",
		'God',
		'Futurama' ),
	Quote("The power of a weapon is great, but the power to improve oneself is greater.",
		'Sensei',
		'Lego Ninjago' ),
	Quote("Creativity is the residue of time wasted.",
		'Albert Einstein' ),
	Quote("How hard is it to decide to be in a good mood, and then just be.. in.. a good mood?",
		'Scroobius Pip',
		'Waiting For The Beat To Kick In' ),
#	Quote("If you want to be a happier person, don't read self-help books, just have happier friends",
#		'Dan Gilbert ? Margin Seligman ?' ),
	Quote("Even the nicest of guys has some nasty within em', ... whether it be greed, lust, or just plain vindictiveness, there's a level of benevolence inside all of us.",
		'Scroobius Pip',
		'Waiting For The Beat To Kick In' ),
	Quote("When you forgive, you love; and when you love, God's light shines on you.",
		'Jon Krakauer',
		'Into the Wild' ),
	Quote("You yourself, as much as anybody in the entire universe, deserve your love and affection.",
		'Buddha' ),
	Quote("Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened. Happiness never decreases by being shared.",
		'Buddha' ),
]

import random

def random_quote():
	return random.choice(quotes)