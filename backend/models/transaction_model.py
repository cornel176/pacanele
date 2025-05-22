from sqlalchemy import Column, Integer, Enum, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from base_model import Base

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    type = Column(Enum('deposit', 'withdrawal', 'win', 'loss', name='transaction_types'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())