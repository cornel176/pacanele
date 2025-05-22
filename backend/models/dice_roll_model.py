from sqlalchemy import Column, Integer, Numeric, Boolean, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from base_model import Base

class DiceRoll(Base):
    __tablename__ = 'dice_rolls'
    __table_args__ = (
        CheckConstraint('user_guess BETWEEN 1 AND 6', name='check_user_guess_range'),
        CheckConstraint('result BETWEEN 1 AND 6', name='check_result_range'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    bet_amount = Column(Numeric(10, 2), nullable=False)
    user_guess = Column(Integer)
    result = Column(Integer)
    win = Column(Boolean, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())