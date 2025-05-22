import mysql.connector
from mysql.connector import Error

# Database configuration
DB_USER = 'root'
DB_PASSWORD = ''
DB_HOST = '127.127.126.26'
DB_NAME = 'gambling_site'

def get_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        if connection.is_connected():
            print("Conexiunea la baza de date a reușit!")
            return connection
    except Error as e:
        print(f"Eroare la conectarea la baza de date: {str(e)}")
        return None

def test_connection():
    """Test the database connection and return True if successful"""
    connection = get_connection()
    if connection is not None:
        connection.close()
        return True
    return False
