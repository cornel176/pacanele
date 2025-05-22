from decimal import Decimal
from random import choice, randint

def calculate_slot_payout(reels, bet_amount):
    symbols = [s.strip() for s in reels.split(' ')]
    if symbols[0] == symbols[1] == symbols[2]:
        multiplier = 10 if symbols[0] == '7' else 5
    elif symbols[0] == symbols[1] or symbols[1] == symbols[2]:
        multiplier = 2
    else:
        multiplier = 0
    return Decimal(bet_amount) * Decimal(multiplier)

def generate_slot_reels():
    symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '7']
    return ' '.join([choice(symbols) for _ in range(3)])

def flip_coin():
    return choice(['heads', 'tails'])

def roll_dice():
    return randint(1, 6)