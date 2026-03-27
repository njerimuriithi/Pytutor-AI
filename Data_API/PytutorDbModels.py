
from pydantic import BaseModel
from typing import Optional


class StudentCreate(BaseModel):
    first_name: str
    second_name: str
    student_email: str
    student_level: str


class StudentResponse(BaseModel):
    student_id: int
    first_name: str
    second_name: str
    student_email: str
    student_level: str

    class Config:
        orm_mode = True


class AnswerRequest(BaseModel):
    question: str
    selected: str
    correct: str


class QuizResultsCreate(BaseModel):
    topics_interested: str
    time_spent: int
    score: int
    total_questions: int
    isHelpful: Optional[bool] = False


class QuizResultsResponse(BaseModel):
    quiz_id: int
    topics_interested: str
    time_spent: int
    score: int
    total_questions: int
    isHelpful: bool

    class Config:
        from_attributes = True
