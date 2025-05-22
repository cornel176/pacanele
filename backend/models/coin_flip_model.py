from sqlalchemy import Column, Integer, Numeric, Enum, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from base_model import Base

class CoinFlip(Base):
    __tablename__ = 'coin_flips'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    bet_amount = Column(Numeric(10, 2), nullable=False)
    user_choice = Column(Enum('heads', 'tails', name='coin_choices'), nullable=False)
    result = Column(Enum('heads', 'tails', name='coin_results'), nullable=False)
    win = Column(Boolean, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())