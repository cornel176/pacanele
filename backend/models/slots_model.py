from sqlalchemy import Column, Integer, Numeric, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from base_model import Base

class Slot(Base):
    __tablename__ = 'slots'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    bet_amount = Column(Numeric(10, 2), nullable=False)
    result_symbols = Column(String(50))
    payout = Column(Numeric(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())