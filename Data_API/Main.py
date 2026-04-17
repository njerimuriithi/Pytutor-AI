from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from PytutorData import Student, engine, SessionLocal, QuizResults, LearningResults, QuizTopic
from PytutorDbModels import StudentResponse, StudentCreate, AnswerRequest, QuizResultsResponse, QuizResultsCreate
from groq import Groq
import json
import re
from typing import List, Optional
import logging
from StudentDashboard import router as student_router
from Dashboard import router as dashboard_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = FastAPI()
app.include_router(student_router)
app.include_router(dashboard_router)
client = Groq(
    api_key="")

origins = [
    "http://localhost:3000"
]

SYSTEM_PROMPT_TEMPLATE = """
You are a Python assessment generator.

Generate exactly 5 multiple choice Python questions.

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
SYSTEM_PROMPT_COURSE_TEMPLATE = """
You are a Python tutor creating structured lessons for students.

Teach the topic(s): {topics}
Difficulty Level: {level}

Return the lesson in Markdown using ONLY the following sections
and in this exact order:

## Overview
## Key Points
## Example
## Summary

Rules:
- Keep explanations simple and beginner friendly.
- Use bullet points in Key Points and Summary.
- Keep explanations short and clear.
- Always include a Python code example in the Example section.
- Do NOT use tables.
- Do NOT include any other sections.
- Do NOT write long paragraphs.
- Format everything in Markdown.
"""


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/learn")
def get_lesson(level: Optional[str] = "beginner",
               topics: Optional[str] = "all"):
    try:
        print("---- /learn endpoint called ----")
        print(f"Raw params -> level: {level}, topics: {topics}")

        # Ensure topics is string
        if isinstance(topics, list):
            topics_str = ",".join(topics)
        else:
            topics_str = topics

        print(f"Formatted topics_str: {topics_str}")

        # Format system prompt
        system_prompt = SYSTEM_PROMPT_COURSE_TEMPLATE.format(
            level=level,
            topics=topics_str
        )

        print("System prompt created successfully")
        print(system_prompt)

        # Messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Teach me {topics_str} at {level} level"}
        ]

        print("Messages prepared:")
        print(messages)

        # Call model
        print("Calling model...")
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            temperature=0.2
        )

        print("Model response received")

        lesson = completion.choices[0].message.content

        print("Lesson content:")
        print(lesson)

        if not lesson or not lesson.strip():
            print("ERROR: Lesson is empty")
            return {"error": "Model returned empty lesson"}

        print("Returning lesson response")

        return {
            "level": level,
            "topics": topics_str,
            "lesson": lesson
        }

    except Exception as e:
        print("ERROR in /learn endpoint:")
        print(str(e))
        return {"error": str(e)}


@app.get("/question")
def get_question(level: Optional[str] = "beginner",
                 topics: Optional[str] = "all"):
    try:
        # Ensure topics is string
        topics_list = [
            t.strip()
            for t in topics.split(",")
            if t and t.strip()
        ]
        topics_str = ", ".join(topics_list)
        print(f"Topics received: {topics_str}, Level: {level}")

        # Prepare system prompt
        try:
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
                level=level,
                topics=topics_str
            )
        except Exception as e:
            return {"error": f"Prompt formatting failed: {str(e)}"}

        # Messages
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Generate a {level} Python assessment for these topics: {topics_str}"
            }
        ]

        # ---- FIRST ATTEMPT ----
        raw = generate_with_retry(messages)
        print("Raw model output:", raw)

        if not raw or not raw.strip():
            return {"error": "Empty response from model"}

        try:
            parsed = extract_json(raw)
            return parsed
        except Exception as e:
            print("First parse failed:", e)

        # ---- RETRY WITH STRICT INSTRUCTION ----
        messages.append({
            "role": "user",
            "content": "Return ONLY valid JSON. No truncation. No explanation."
        })

        try:
            raw_retry = generate_with_retry(messages, retries=1)
            print("Retry output:", raw_retry)

            parsed_retry = extract_json(raw_retry)
            return parsed_retry

        except Exception as e2:
            print("Retry failed:", e2)
            return {
                "error": "Failed to parse JSON after retry",
                "raw": raw
            }

    except Exception as e:
        print("Unexpected error:", e)
        return {"error": str(e)}


def generate_with_retry(messages, retries=2):
    for attempt in range(retries):
        try:
            completion = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=messages,
                temperature=0.3
            )

            raw = completion.choices[0].message.content

            if not raw.strip():
                raise Exception("Empty response")

            return raw

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")

    raise Exception("All retries failed")

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
        student_id=2,
        topics_interested=result.topics_interested,
        time_spent=result.time_spent,
        correct_answers=result.correct_answers,
        total_questions=result.total_questions,
        answered_questions=result.answered_questions,
        completed=result.completed

    )

    db.add(new_results)
    db.commit()
    db.refresh(new_results)

    quiz_id = new_results.quiz_id
    logger.info(f"Quiz ID created: {quiz_id}")
    level = result.level

    topics_list = result.topics_interested.split(",")
    logger.info(f"Topics list : {topics_list}")

    for topic in topics_list:
        new_topic = QuizTopic(

            quiz_id=quiz_id,
            topic=topic.strip(),
            level=level
        )
        db.add(new_topic)

    db.commit()
    return new_results


@app.post("/learning-session")
def save_learning_session(session: dict, db: Session = Depends(get_db)):
    try:
        new_session = LearningResults(
            student_id=session["student_id"],
            topic=session["topic"],
            level=session["level"],
            time_spent=session["time_spent"]
        )

        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        return {"message": "Saved successfully"}

    except Exception as e:
        return {"error": str(e)}


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


def extract_json(text):
    start = text.find("{")
    end = text.rfind("}") + 1
    json_str = text[start:end]
    return json.loads(json_str)


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
