from fastapi import FastAPI, Depends, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import text
from PytutorData import SessionLocal
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

# origins = [
#     "http://localhost:3000"
# ]
# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard/students")
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


@router.get("/dashboard/topics")
def get_topics_stats(db: Session = Depends(get_db)):
    try:
        Number_Of_Students_Per_Topic = text("""
         SELECT 
            COUNT(DISTINCT quizresults.student_id) AS NumberOfStudentsPerTopic,
            quiztopic.topic,
            quiztopic.level
            FROM quiztopic
            INNER JOIN quizresults
                ON quiztopic.quiz_id = quizresults.quiz_id
            GROUP BY quiztopic.topic, quiztopic.level
            ORDER BY NumberOfStudentsPerTopic DESC;
        """)

        students_per_topic = db.execute(
            Number_Of_Students_Per_Topic).fetchall()

        return {

            "students_per_topic": [
                {
                    "topic": row.topic,
                    "count": row.NumberOfStudentsPerTopic,
                    "level": row.level
                }
                for row in students_per_topic
            ]
        }

    except Exception as e:
        return {"error": str(e)}


@router.get("/dashboard/studenttopics")
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


@router.get("/dashboard/studentperformance")
def get_student_data(db: Session = Depends(get_db)):
    try:
        Students_Details = text("""
            SELECT 
            CONCAT(S.first_name, ' ', S.second_name) AS Full_Name,
            S.student_level,
            S.student_id,
                                

   
            STUFF((
                SELECT DISTINCT ', ' + QT2.topic
                FROM quiztopic QT2
                INNER JOIN quizresults QR2 
                    ON QT2.quiz_id = QR2.quiz_id
                WHERE QR2.student_id = S.student_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS Topics_Taken,

   
            SUM(QR.time_spent) AS Total_Time_Spent,
            MAX(QR.time_spent) AS Highest_Time_Spent,

            SUM(QR.total_questions) AS Total_Questions,
            SUM(QR.answered_questions) AS Total_Answered_Questions,
            SUM(QR.correct_answers) AS Total_Correct_Answers,

            COUNT(QR.quiz_id) AS Total_Attempts,
            SUM(CASE WHEN QR.completed = 1 THEN 1 ELSE 0 END) AS Completed_Attempts,
	        CAST(
            (SUM(QR.correct_answers) * 100.0) / 
            NULLIF(SUM(QR.answered_questions), 0)
            AS DECIMAL(5,2)) AS Accuracy_Percent

            FROM quizresults QR
            INNER JOIN student S
                ON QR.student_id = S.student_id

            GROUP BY 
                S.student_id,
                S.first_name,
                S.second_name,
                S.student_level

            ORDER BY Total_Time_Spent DESC;

            """)

        students_performance_details = db.execute(
            Students_Details).fetchall()

        return {

            "students_performance_details": [
                {
                    "FullName": row.Full_Name,
                    "studentlevel": row.student_level,
                    "TopicsTaken": row.Topics_Taken,
                    "TotalTimeSpent": row.Total_Time_Spent,
                    "HighestTimeSpent": row.Highest_Time_Spent,
                    "TotalAnsweredQuestions": row.Total_Answered_Questions,
                    "TotalQuestions": row.Total_Questions,
                    "CorrectAnswers": row.Total_Correct_Answers,
                    "Attempts": row.Total_Attempts,
                    "CompleteQuestions": row.Completed_Attempts,
                    "AccuracyPercentage": row.Accuracy_Percent,
                    "studentId": row.student_id

                }
                for row in students_performance_details
            ]
        }

    except Exception as e:
        return {"error": str(e)}
