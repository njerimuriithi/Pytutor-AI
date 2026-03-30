from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from PytutorData import SessionLocal

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/dashboard/students")
def get_student_stats(db: Session = Depends(get_db)):
    try:
        total_students_query = text("""
            SELECT COUNT(student_id) AS NumberOfStudents
            FROM student
        """)

        students_per_level_query = text("""
            SELECT student_level, COUNT(student_id) AS NumberOfStudents
            FROM student
            GROUP BY student_level
        """)

        total_students = db.execute(total_students_query).fetchone()
        students_per_level = db.execute(students_per_level_query).fetchall()

        return {
            "total_students": total_students.NumberOfStudents,
            "students_per_level": [
                {
                    "student_level": row.student_level,
                    "count": row.NumberOfStudents
                }
                for row in students_per_level
            ]
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/dashboard/topics")
def get_topics_stats(db: Session = Depends(get_db)):
    try:
        Number_Of_Students_Per_Topic = text("""
         SELECT 
            Count(DISTINCT quizresults.student_id) AS NumberOfStudentsPerTopic,
            topic
            FROM quiztopic
            INNER JOIN quizresults
            ON quiztopic.quiz_id = quizresults.quiz_id
            GROUP BY topic
            ORDER BY NumberOfStudentsPerTopic DESC;
        """)

        students_per_topic = db.execute(
            Number_Of_Students_Per_Topic).fetchall()

        return {

            "students_per_topic": [
                {
                    "topic": row.topic,
                    "count": row.NumberOfStudentsPerTopic
                }
                for row in students_per_topic
            ]
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/dashboard/studenttopics")
def get_studenttopics_stats(db: Session = Depends(get_db)):
    try:
        Students_Per_Topic_Details = text("""
          SELECT 
            CONCAT(S.first_name,' ',S.second_name) AS Full_Name,
            QT.topic,
            QR.time_spent,
            QR.total_questions 
            FROM quiztopic QT
            INNER JOIN quizresults QR
            ON QT.quiz_id = QR.quiz_id
            INNER JOIN student S
            ON QR.student_id = S.student_id
        """)

        students_per_topic_details = db.execute(
            Students_Per_Topic_Details).fetchall()

        return {

            "students_per_topic_details": [
                {
                    "FullName": row.Full_Name,
                    "topic": row.topic,
                    "time_spent": row.time_spent,
                    "total_questions": row.total_questions

                }
                for row in students_per_topic_details
            ]
        }

    except Exception as e:
        return {"error": str(e)}
