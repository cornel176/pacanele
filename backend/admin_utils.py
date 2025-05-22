from datetime import datetime, timedelta
from models import Slot, User, Transaction
from models import db
from game_utils import CoinFlip, DiceRoll

def generate_site_stats():
    # Exemplu: Raport săptămânal
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    stats = {
        'period': {'start': start_date, 'end': end_date},
        'total_users': User.query.count(),
        'new_users': User.query.filter(User.created_at.between(start_date, end_date)).count(),
        'total_bets': {
            'slots': Slot.query.count(),
            'dice': DiceRoll.query.count(),
            'coin': CoinFlip.query.count()
        },
        'total_wagered': {
            'slots': db.session.query(db.func.sum(Slot.bet_amount)).scalar() or 0,
            'dice': db.session.query(db.func.sum(DiceRoll.bet_amount)).scalar() or 0,
            'coin': db.session.query(db.func.sum(CoinFlip.bet_amount)).scalar() or 0
        }
    }
    
    return stats