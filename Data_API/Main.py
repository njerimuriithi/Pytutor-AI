from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from PytutorData import Student, engine, SessionLocal, QuizResults, QuizTopic
from PytutorDbModels import StudentResponse, StudentCreate, AnswerRequest, QuizResultsResponse, QuizResultsCreate
from groq import Groq
import json
import re
from typing import List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI()
client = Groq(
    api_key="")

origins = [
    "http://localhost:3001"
]

SYSTEM_PROMPT_TEMPLATE = """
You are a Python assessment generator.

Generate exactly 1 multiple choice Python questions.

Level: {level}
Topics: {topics}

Rules:
- Include a very short explanation (max 10 words).
- 4 options per question (A, B, C, D).
- Only one correct answer.
- Escape quotes inside strings.
- Do not use newline characters in explanations.
- Return ONLY valid JSON.
- No markdown.
- No text outside JSON.
- Ensure JSON is complete.

Format:
{{
  "questions": [
    {{
      "question": "Question text",
      "options": {{
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      }},
      "correct_answer": "A",
      "explanation": "Very short explanation"
    }}
  ]
}}
"""


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/question")
def get_question(level: Optional[str] = "beginner",
                 topics: Optional[str] = "all"):
    try:
        # Ensure topics is a string
        topics_str = topics if isinstance(topics, str) else ",".join(topics)
        print(f"Topics received: {topics_str}, Level: {level}")

        # Format system prompt safely
        try:
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
                level=level, topics=topics_str)
        except Exception as e:
            print(f"Error formatting system prompt: {e}")
            return {"error": f"Error formatting system prompt: {e}"}

        print(f"System prompt prepared:\n{system_prompt}")

        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate a {level} Python assessment for these topics: {topics_str}"}
        ]

        # Call model
        try:
            completion = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=messages,
                temperature=0.3
            )
        except Exception as e:
            print(f"Error calling model: {e}")
            return {"error": f"Error calling model: {e}"}

        raw = completion.choices[0].message.content
        print(f"Raw model output:\n{raw}")

        if not raw.strip():
            return {"error": "Model returned empty response"}

        # Fix JSON safely
        try:
            parsed = fix_json(raw)
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            return {"error": f"Error parsing JSON: {e}", "raw": raw}

        return parsed

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"error": f"Unexpected error: {e}"}


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
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Update questions scores
@app.post("/quizresults/", response_model=QuizResultsResponse)
def create_assesments(result: QuizResultsCreate, db: Session = Depends(get_db)):
    logger.info("Creating new quiz result...")
    new_results = QuizResults(
        student_id=3,
        topics_interested=result.topics_interested,
        time_spent=result.time_spent,
        score=result.score,
        total_questions=result.total_questions,
        isHelpful=result.isHelpful
    )

    db.add(new_results)
    db.commit()
    db.refresh(new_results)

    quiz_id = new_results.quiz_id
    logger.info(f"Quiz ID created: {quiz_id}")

    topics_list = result.topics_interested.split(",")
    logger.info(f"Topics list : {topics_list}")

    for topic in topics_list:
        new_topic = QuizTopic(

            quiz_id=quiz_id,
            topic=topic.strip()
        )
        db.add(new_topic)

    db.commit()
    return new_results


# @app.post("/students/")
# async def create_student(student: StudentCreate, request: Request):
#     raw_body = await request.body()  # raw bytes
#     print("Raw request body:", raw_body)

#     json_body = await request.json()
#     print("Parsed JSON body:", json_body)

#     print("Pydantic model:", student)

    # return student


@app.post("/students/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Student).filter(
        Student.student_email == student.student_email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists!")

    # ✅ Create new student (use SQLAlchemy model)
    new_student = Student(**student.dict())

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student

# Update Student


@app.put("/student/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
    existing_student = db.query(Student).filter(
        Student.student_id == student_id
    ).first()

    if not existing_student:
        raise HTTPException(status_code=400, detail="Student Does Not exists!")

    for field, value in student.dict().items():
        setattr(existing_student, field, value)

    db.commit()
    db.refresh(existing_student)
    return existing_student


@app.get("/students", response_model=List[StudentResponse])
def get_allstudents(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students


def fix_json(raw):
    raw = re.sub(r"```json|```", "", raw)

    try:
        return json.loads(raw)
    except:
        pass

    if raw.count("{") > raw.count("}"):
        raw += "}" * (raw.count("{") - raw.count("}"))

    if raw.count("[") > raw.count("]"):
        raw += "]" * (raw.count("[") - raw.count("]"))

    return json.loads(raw)


@app.post("/answer")
def check_answer(data: AnswerRequest):
    if data.selected == data.correct:
        return {
            "result": "Correct!",
            "explanation": data.explanation
        }
    else:
        return {
            "result": "Incorrect",
            "explanation": data.explanation
        }
