from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean


DATABASE_URL = (
    "mssql+pyodbc://@DESKTOP-J4O6NP0/PyTutor_AI"
    "?driver=ODBC+Driver+17+for+SQL+Server"
    "&trusted_connection=yes"
)
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Student(Base):
    __tablename__ = "student"
    student_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255))
    second_name = Column(String(255))
    student_email = Column(String(255), unique=True, index=True)
    student_level = Column(String(255))
    registered_date = Column(DateTime, default=datetime.utcnow)


class QuizResults(Base):
    __tablename__ = "quizresults"
    quiz_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(255), default="2")
    time_spent = Column(Integer)  # seconds
    topics_interested = Column(String(255))
    correct_answers = Column(Integer)
    answered_questions = Column(Integer)
    completed = Column(Boolean)
    total_questions = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class QuizTopic(Base):
    __tablename__ = "quiztopic"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer)
    topic = Column(String(255))
    level = Column(String(255))


class LearningResults(Base):
    __tablename__ = "learning_sessions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    topic = Column(String(255))
    level = Column(String(255))
    time_spent = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


# def Test_db():
#     db = SessionLocal()
#     new_student = StudentCreate(
#         first_name="James",
#         second_name="Muchina",
#         student_email="James@gmail.com",
#         student_level="Beginner",
#         registered_date=datetime.now()
#     )

#     db.add(new_student)
#     db.commit()
#     db.refresh(new_student)

#     print(new_student.student_id)


# Test_db()
