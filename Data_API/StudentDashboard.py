from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from PytutorData import SessionLocal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3001"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/studentdashboard/{studentid}")
def get_individual_student_details(studentid: int, db: Session = Depends(get_db)):
    try:
        individual_students_query = text("""
            SELECT 
            CONCAT(S.first_name, ' ', S.second_name) AS Full_Name,
            S.student_level,

            
            STUFF((
                SELECT DISTINCT ', ' + QT2.topic
                FROM quiztopic QT2
                INNER JOIN quizresults QR2 
                    ON QT2.quiz_id = QR2.quiz_id
                WHERE QR2.student_id = S.student_id
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS Topics_Taken,

            
            COUNT(QR.quiz_id) AS Total_Attempts,
            SUM(CASE WHEN QR.completed = 1 THEN 1 ELSE 0 END) AS Completed_Attempts,

            
            SUM(QR.time_spent) AS Total_Time_Spent,
            AVG(QR.time_spent) AS Avg_Time_Spent,
            MAX(QR.time_spent) AS Highest_Time_Spent,

            
            SUM(QR.total_questions) AS Total_Questions,
            SUM(QR.answered_questions) AS Total_Answered,
            SUM(QR.correct_answers) AS Total_Correct,

            
            CAST(
                (SUM(QR.correct_answers) * 100.0) / 
                NULLIF(SUM(QR.answered_questions), 0)
            AS DECIMAL(5,2)) AS Accuracy_Percent,

           
            CAST(
                (SUM(CASE WHEN QR.completed = 1 THEN 1 ELSE 0 END) * 100.0) /
                NULLIF(COUNT(QR.quiz_id), 0)
            AS DECIMAL(5,2)) AS Completion_Percent

            FROM quizresults QR
            INNER JOIN student S
                ON QR.student_id = S.student_id

             WHERE S.student_id =:studentid

            GROUP BY 
                S.student_id,
                S.first_name,
                S.second_name,
                S.student_level;
                    """)

        Poor_Performing_Topics = text("""
          SELECT TOP 5
                QT.topic,
                AVG(QR.correct_answers * 1.0 / NULLIF(QR.answered_questions, 0)) * 100 AS Accuracy_Percent,
                COUNT(*) AS Attempts
            FROM quiztopic QT
            INNER JOIN quizresults QR
                ON QT.quiz_id = QR.quiz_id
            WHERE QR.student_id = :studentid
            GROUP BY QT.topic
            ORDER BY Accuracy_Percent ASC;
        """)
        Best_performing_Topics = text("""
                    SELECT TOP 5
                        QT.topic,
                        AVG(QR.correct_answers * 1.0 / NULLIF(QR.answered_questions, 0)) * 100 AS Accuracy_Percent,
                        COUNT(*) AS Attempts
                    FROM quiztopic QT
                    INNER JOIN quizresults QR
                        ON QT.quiz_id = QR.quiz_id
                    WHERE QR.student_id = :studentid
                    GROUP BY QT.topic
                    ORDER BY Accuracy_Percent ASC;
                    """
                                      )
        Student_Activity = text("""
                    SELECT 
                    QR.quiz_id,
                    QR.created_at,
                    QR.time_spent,
                    QR.answered_questions,
                    QR.correct_answers,
                    QR.completed,
                    QT.topic
                FROM quizresults QR
                INNER JOIN quiztopic QT
                    ON QR.quiz_id = QT.quiz_id
                WHERE QR.student_id = :studentid
                ORDER BY QR.created_at DESC;
            """)

        individual_students_result = db.execute(
            individual_students_query, {"studentid": studentid}).fetchall()
        poor_topics_result = db.execute(Poor_Performing_Topics, {
                                        "studentid": studentid}).fetchall()
        best_topics_result = db.execute(Best_performing_Topics, {
                                        "studentid": studentid}).fetchall()
        activity_result = db.execute(
            Student_Activity, {"studentid": studentid}).fetchall()

        return {
            "student_details": [dict(row._mapping) for row in individual_students_result],
            "poor_performing_topics": [dict(row._mapping) for row in poor_topics_result],
            "best_performing_topics": [dict(row._mapping) for row in best_topics_result],
            "student_activity": [dict(row._mapping) for row in activity_result]
        }

    except Exception as e:
        return {"error": str(e)}
