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


@router.get("/dashboard/allstudentsdata")
def get_inactive_students(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                  S.student_id,
                  CONCAT(S.first_name,' ',S.second_name) AS full_name,
                  MAX(QR.created_at) AS last_activity,
                  DATEDIFF(DAY, MAX(QR.created_at), GETDATE()) AS days_inactive
            FROM student S
            LEFT JOIN quizresults QR 
                ON QR.student_id = S.student_id
            GROUP BY 
                S.student_id, 
                S.first_name, 
                S.second_name
            HAVING 
                MAX(QR.created_at) < DATEADD(DAY, -7, GETDATE())
                OR MAX(QR.created_at) IS NULL
            ORDER BY last_activity ASC
        """)
        activity_trend_query = text("""
                        SELECT
                            CAST(created_at AS DATE) AS activity_date,
                            SUM(time_spent) AS total_time_spent
                        FROM (
                            SELECT created_at, time_spent FROM quizresults
                            UNION ALL
                            SELECT created_at, time_spent FROM learning_sessions
                        ) AS activity
                        GROUP BY CAST(created_at AS DATE)
                        ORDER BY activity_date;
                        """)

        improved_student_query = text("""
                            WITH Ranked AS (
                                SELECT
                                    QR.student_id,
                                    QR.correct_answers * 1.0 / NULLIF(QR.answered_questions, 0) AS score,
                                    QR.created_at,
                                    S.student_level,
                                    ROW_NUMBER() OVER (PARTITION BY QR.student_id ORDER BY QR.created_at ASC) AS rn_asc,
                                    ROW_NUMBER() OVER (PARTITION BY QR.student_id ORDER BY QR.created_at DESC) AS rn_desc
                                FROM quizresults QR
                                INNER JOIN student S ON S.student_id = QR.student_id   
                            ),

                            FirstLast AS (
                                SELECT
                                    student_id,
                                    MAX(CASE WHEN rn_asc = 1 THEN score END) AS first_score,
                                    MAX(CASE WHEN rn_desc = 1 THEN score END) AS last_score
                                FROM Ranked
                                GROUP BY student_id
                            )

                            SELECT TOP 1
                                S.student_id,
                                CONCAT(S.first_name,' ',S.second_name) AS full_name,
                                (last_score - first_score) * 100 AS improvement
                            FROM FirstLast F
                            INNER JOIN student S ON S.student_id = F.student_id
                            ORDER BY improvement DESC;
            """)

        student_activity_query = text("""
                    WITH Activity AS (
                        SELECT 
                            student_id,
                            answered_questions,
                            correct_answers,
                            total_questions,
                            time_spent,
                            created_at,
                            completed
                        FROM quizresults
                    ),

                    TopicAgg AS (
                        SELECT
                            QR.student_id,
                            QT.topic,
                            AVG(QR.correct_answers * 1.0 / NULLIF(QR.answered_questions, 0)) * 100 AS accuracy,
                            COUNT(*) AS attempts
                        FROM quizresults QR
                        INNER JOIN quiztopic QT ON QT.quiz_id = QR.quiz_id
                        GROUP BY QR.student_id, QT.topic
                    ),

                    StudentBase AS (
                        SELECT 
                            S.student_id,
                            CONCAT(S.first_name, ' ', S.second_name) AS FullName,
                            S.student_level
                        FROM student S
                    )

                    SELECT 
                        S.student_id,
                        S.FullName,
                        S.student_level,

                        -- PERFORMANCE METRICS
                        COUNT(ACT.created_at) AS total_assessments,

                        SUM(ACT.time_spent) AS total_time_spent,

                        CAST(
                            AVG(
                                CASE 
                                    WHEN ACT.answered_questions = 0 THEN 0
                                    ELSE (ACT.correct_answers * 100.0 / ACT.answered_questions)
                                END
                            ) AS DECIMAL(5,2)
                        ) AS accuracy_percent,

                        CAST(
                            AVG(
                                CASE WHEN ACT.completed = 1 THEN 100 ELSE 0 END
                            ) AS DECIMAL(5,2)
                        ) AS completion_percent,

                        MAX(ACT.created_at) AS last_activity,

                        -- MOST ACTIVE TOPIC
                        (
                            SELECT TOP 1 TA.topic
                            FROM TopicAgg TA
                            WHERE TA.student_id = S.student_id
                            ORDER BY TA.attempts DESC
                        ) AS most_attempted_topic,

                        -- WEAK TOPICS (TOP 3)
                        (
                            SELECT STRING_AGG(topic, ', ')
                            FROM (
                                SELECT TOP 3 TA.topic
                                FROM TopicAgg TA
                                WHERE TA.student_id = S.student_id
                                ORDER BY TA.accuracy ASC
                            ) X
                        ) AS weak_topics,

                        -- STRONG TOPICS (TOP 3)
                        (
                            SELECT STRING_AGG(topic, ', ')
                            FROM (
                                SELECT TOP 3 TA.topic
                                FROM TopicAgg TA
                                WHERE TA.student_id = S.student_id
                                ORDER BY TA.accuracy DESC
                            ) Y
                        ) AS strong_topics,

                        -- STATUS 
                        CASE
                            WHEN AVG(
                                CASE WHEN ACT.answered_questions = 0 THEN 0
                                ELSE (ACT.correct_answers * 100.0 / ACT.answered_questions)
                                END
                            ) < 50 THEN 'At Risk'
                            WHEN AVG(
                                CASE WHEN ACT.answered_questions = 0 THEN 0
                                ELSE (ACT.correct_answers * 100.0 / ACT.answered_questions)
                                END
                            ) > 75 THEN 'Great Student'

                            WHEN AVG(
                                CASE WHEN ACT.answered_questions = 0 THEN 0
                                ELSE (ACT.correct_answers * 100.0 / ACT.answered_questions)
                                END
                            ) < 75 THEN 'Needs Attention'

                            ELSE 'No Progress'
                        END AS performance_status

                    FROM StudentBase S
                    LEFT JOIN Activity ACT ON ACT.student_id = S.student_id

                    GROUP BY 
                        S.student_id,
                        S.FullName,
                        S.student_level
                    ORDER BY last_activity DESC;""")

        result = db.execute(query).fetchall()
        improved_student_result = db.execute(improved_student_query).fetchall()
        student_activity_result = db.execute(student_activity_query).fetchall()
        activity_trend_result = db.execute(activity_trend_query).fetchall()

        return {
            "inactive_students": [dict(row._mapping) for row in result],
            "improved_student": [dict(row._mapping) for row in improved_student_result],
            "student_activity": [dict(row._mapping) for row in student_activity_result],
            "activity_trend": [dict(row._mapping) for row in activity_trend_result]
        }

    except Exception as e:
        return {"error": str(e)}


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
        difficult_topics_query = text("""
                SELECT
                    QT.topic,
                    QT.level,
                    COUNT(*) AS total_attempts,

                    SUM(QR.answered_questions) AS total_answered,
                    SUM(QR.correct_answers) AS total_correct,

                    CAST(
                        SUM(QR.correct_answers) * 100.0 /
                        NULLIF(SUM(QR.answered_questions), 0)
                    AS DECIMAL(5,2)) AS accuracy_percent,

                    CAST(
                        100 - (
                            SUM(QR.correct_answers) * 100.0 /
                            NULLIF(SUM(QR.answered_questions), 0)
                        )
                    AS DECIMAL(5,2)) AS difficulty_score

                FROM quizresults QR
                INNER JOIN quiztopic QT
                    ON QR.quiz_id = QT.quiz_id

                GROUP BY
                    QT.topic,
                    QT.level

                ORDER BY difficulty_score DESC;
                """)

        students_per_topic = db.execute(
            Number_Of_Students_Per_Topic).fetchall()
        difficult_topics_result = db.execute(difficult_topics_query).fetchall()

        return {

            "students_per_topic": [
                {
                    "topic": row.topic,
                    "count": row.NumberOfStudentsPerTopic,
                    "level": row.level
                }
                for row in students_per_topic

            ],
            "difficult_topics": [dict(row._mapping) for row in difficult_topics_result]
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
