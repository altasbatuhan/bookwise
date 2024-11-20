from flask import Flask, jsonify, request, session
from flask_cors import CORS
import os
import psycopg2
from dotenv import load_dotenv
from recommender import BookRecommender, get_data_from_postgresql, recommendations
import recommender
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps  
import requests

app = Flask(__name__)
CORS(app, supports_credentials=True)
load_dotenv()
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# Decorator for database connection

def db_operation(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            result = func(cursor, *args, **kwargs)
            connection.commit()
            return result
        except psycopg2.Error as e:
            return jsonify({'error': f'Veritabanı hatası: {e}'}), 500
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    return wrapper

def get_db_connection():
    url = os.getenv("DATABASE_URL")
    connection = psycopg2.connect(url)
    return connection

# Test the database connection
def test_db_connection():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")  # Simple test query
        cursor.close()
        connection.close()
        print("Database connection successful.")
    except Exception as e:
        print("Database connection error:", e)

test_db_connection()

def get_book_thumbnail(isbn):
    """
 
    Returns the book thumbnail by ISBN number. Checks the database first, 
    uses the Open Library API if not found.
    Args:
      isbn: ISBN number of the book.
    Returns:
      The URL of the book thumbnail, or None if the image was not found.
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT thumbnail FROM books WHERE isbn13 = %s", (isbn,))
        result = cursor.fetchone()
        if result and result[0]:  # If there is thumbnail in the database
            return result[0]

        #  If thumbnail is not available in the database, use the Open Library API

        url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"  
        response = requests.get(url)
        if response.status_code == 200:
            return url
        else:
            return None
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route('/register', methods=['POST'])
@db_operation  # Using a decorator
def register(cursor):
    try:
        username = request.json.get('username')
        email = request.json.get('email')
        password = request.json.get('password')

        if not username or not email or not password:
            return jsonify({'error': 'Username, email and password are required'}), 400

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({'error': 'This username or email is already registered'}), 409

        # Hash the password
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Add new user to the database
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500



    
@app.route('/login', methods=['POST'])
@db_operation  # Decorator 
def login(cursor):
    try:
        username = request.json.get('username')
        password = request.json.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Find the user in the database
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401

        if check_password_hash(user[3], password):
            # Start session

            return jsonify({'message': 'Login successful', 'user': {
                'user_id': user[0],
                'username': user[1],
                'email': user[2]
            }}), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/logout', methods=['POST'])  
@db_operation
def logout(cursor):
    try:

        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
df = get_data_from_postgresql()

@app.route('/delete-user/<int:user_id>', methods=['DELETE'])
@db_operation
def delete_user(cursor, user_id):
    """
    Deletes the user account.
    Associated likes and comments are also deleted before the user is deleted.
    Args:
        user_id (int): ID of the user to delete.
    Returns:
        tuple: JSON response and HTTP status code.
    """
    try:
        # Get the current_password from the request body
        data = request.get_json()
        
        current_password = data.get('password')  # Frontend'den gönderilen 'password'

        # Check if current_password is provided
        if not current_password:
            return jsonify({'error': 'Current password is required'}), 400
        
        # Fetch the user from the database to get the stored password
        cursor.execute("SELECT password FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if the current password is correct
        if not check_password_hash(user[0], current_password):
            return jsonify({'error': 'Incorrect current password'}), 401

        # Delete likes and comments before deleting the user
        cursor.execute("DELETE FROM book_likes WHERE user_id = CAST(%s AS VARCHAR)", (user_id,))
        cursor.execute("DELETE FROM book_reviews WHERE user_id = CAST(%s AS VARCHAR)", (user_id,))

        # Delete the user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        return jsonify({'message': 'User successfully deleted'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/update-user/<int:user_id>', methods=['PUT'])
@db_operation
def update_user(cursor, user_id):
    """
    Updates user information, including username, email, and password.

    Args:
        user_id (int): The ID of the user to update.

    Request Body:
        username (str): The new username.
        email (str): The new email address.
        current_password (str): The user's current password.
        old_password (str): The user's current password (for password change).
        new_password (str): The user's new password.

    Returns:
        tuple: A JSON response and an HTTP status code.
    """
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        current_password = data.get('current_password')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        # Check if at least one field is updated
        if not any([username, email, new_password]):
            return jsonify({'error': 'At least one field must be updated'}), 400

        # Check the user's current password if a new password is provided
        if new_password:
            cursor.execute("SELECT password FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if not check_password_hash(user[0], old_password):
                return jsonify({'error': 'Incorrect old password'}), 401

            # Hash the new password
            hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')

            # Update the password
            cursor.execute("UPDATE users SET password = %s WHERE user_id = %s", (hashed_password, user_id))

        # Check if the new username or email already exists
        if username:
            cursor.execute("SELECT 1 FROM users WHERE username = %s AND user_id != %s", (username, user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Username already exists'}), 409

        if email:
            cursor.execute("SELECT 1 FROM users WHERE email = %s AND user_id != %s", (email, user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Email already exists'}), 409

        # Check the user's current password before updating username or email
        if username or email:
            cursor.execute("SELECT password FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            if not check_password_hash(user[0], current_password):
                return jsonify({'error': 'Incorrect current password'}), 401

            # Update username and email if provided
            if username:
                cursor.execute("UPDATE users SET username = %s WHERE user_id = %s", (username, user_id))
            if email:
                cursor.execute("UPDATE users SET email = %s WHERE user_id = %s", (email, user_id))

        # Fetch updated user data
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        updated_user = cursor.fetchone()

        return jsonify({
            'message': 'User information updated successfully',
            'user': {
                'user_id': updated_user[0],
                'username': updated_user[1],
                'email': updated_user[2]
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Initialize and fit the recommender
recommender = BookRecommender()  # Globally defined recommender object
recommender.fit(df)

@app.route('/api/ai-suggestions', methods=['GET'])
def ai_suggestions():
    """
    Endpoint for receiving AI-powered book recommendations.

    Parameters:
        category (str): The category from which to retrieve recommendations.

    Return Value:
        json: List of recommended books.
    """
    try:
        category = request.args.get('category', '')

        # Get the recommendations
        recommendations = recommender.recommend_books('user1', category)

        # Convert DataFrame to JSON format
        recommendations_list = recommendations.to_dict('records')

        return jsonify(recommendations_list)

    except Exception as e:
        print("An error occurred while getting AI suggestions:", e)
        return jsonify({"error": "An error occurred", "message": str(e)}), 500

@app.route('/books/recommendations', methods=['GET'])
def get_recommendations():
    recommendation_list = [{
        "isbn13": row['isbn13'],
        "title": row['title'],
        "authors": row['authors'],
        "categories": row['categories'],
        "thumbnail": row['thumbnail'],
        "description": row['description'],
        "average_rating": row["average_rating"],
        "similarity_score": row['similarity_score'],
        "recommendation_basis": row['recommendation_basis']
    } for index, row in recommendations.iterrows()]

    print(recommendations.head())
    return jsonify(recommendation_list)

@app.route('/book/<isbn13>', methods=['GET'])
def get_book_by_isbn(isbn13):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT isbn13, title, subtitle, authors, categories, 
                   description, published_year, average_rating, num_pages, ratings_count 
            FROM books
            WHERE isbn13 = %s;
        """, (isbn13,))
        book = cursor.fetchone()

        if book:
            book_data = {
                "isbn13": book[0],
                "title": book[1],
                "subtitle": book[2],
                "authors": book[3],
                "categories": book[4],
                "thumbnail": get_book_thumbnail(isbn13),  # Thumbnail'i al
                "description": book[5],
                "published_year": book[6],
                "average_rating": book[7],
                "num_pages": book[8],
                "ratings_count": book[9]
            }
            cursor.close()
            connection.close()
            return jsonify(book_data)
        else:
            return jsonify({"error": "Book not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/books', methods=['GET'])
def get_books():
    try:
        page = int(request.args.get('page', 1))  # Default to page 1 if not provided
        limit = int(request.args.get('limit', 50))  # Default to 50 books per page
        category = request.args.get('category', '')  # Kategori parametresi

        offset = (page - 1) * limit  # Calculate the offset

        connection = get_db_connection()
        cursor = connection.cursor()

        # If there is a category parameter, filter by category

        if category:
            cursor.execute("""
                SELECT isbn13, title, subtitle, authors, categories, thumbnail, 
                       description, published_year, average_rating, num_pages, ratings_count 
                FROM books
                WHERE categories LIKE %s
                LIMIT %s OFFSET %s;
            """, (f'%{category}%', limit, offset))
        else:
            cursor.execute("""
                SELECT isbn13, title, subtitle, authors, categories, thumbnail, 
                       description, published_year, average_rating, num_pages, ratings_count 
                FROM books
                LIMIT %s OFFSET %s;
            """, (limit, offset))

        books = cursor.fetchall()

        book_list = [{
            "isbn13": book[0],
            "title": book[1],
            "subtitle": book[2],
            "authors": book[3],
            "categories": book[4],
            "thumbnail": book[5],
            "description": book[6],
            "published_year": book[7],
            "average_rating": book[8],
            "num_pages": book[9],
            "ratings_count": book[10]
        } for book in books]

        cursor.close()
        connection.close()

        return jsonify(book_list)
        

    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": "An error occurred", "message": str(e)}), 500

@app.route('/categories/with-book-count', methods=['GET'])
def get_categories_with_book_count():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT categories, COUNT(*) 
            FROM books
            GROUP BY categories;
        """)
        categories_with_count = cursor.fetchall()

        #  combine the name of the categories and the number of books
        categories_list = [{
            "category": category[0],
            "book_count": category[1]
        } for category in categories_with_count]

        cursor.close()
        connection.close()

        return jsonify(categories_list)

    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": "An error occurred", "message": str(e)}), 500


@app.route('/books/liked/<int:user_id>', methods=['GET', 'POST', 'DELETE'])
def liked_books(user_id):
    if request.method == 'GET':
        try:
            connection = get_db_connection()
            cursor = connection.cursor()

            # Fetch books liked by the user, including all book details
            cursor.execute("""
                SELECT b.isbn13, b.title, b.subtitle, b.authors, b.categories, b.thumbnail, 
                       b.description, b.published_year, b.average_rating, b.num_pages, b.ratings_count
                FROM books b
                JOIN book_likes bl ON b.isbn13 = bl.isbn13
                WHERE CAST(bl.user_id AS INTEGER) = %s;  -- Cast bl.user_id to integer
            """, (user_id,))
            
            liked_books = cursor.fetchall()

            if not liked_books:
                return jsonify({"error": "No liked books found for this user."}), 404

            liked_books_list = []
            for book in liked_books:
                liked_book = {
                    "isbn13": book[0],
                    "title": book[1],
                    "subtitle": book[2],
                    "authors": book[3],
                    "categories": book[4],
                    "thumbnail": book[5],
                    "description": book[6],
                    "published_year": book[7],
                    "average_rating": book[8],
                    "num_pages": book[9],
                    "ratings_count": book[10]
                }
                liked_books_list.append(liked_book)

            cursor.close()
            connection.close()

            return jsonify({"user_id": user_id, "liked_books": liked_books_list})

        except Exception as e:
            print("An error occurred while fetching liked books:", e)
            return jsonify({"error": "An error occurred", "message": str(e)}), 500


    elif request.method == 'POST':
        try:
            isbn13 = request.json.get("isbn13")
            if not isbn13:
                return jsonify({"error": "ISBN13 is required to like a book."}), 400

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO book_likes (user_id, isbn13)
                VALUES (%s, %s)
                ON CONFLICT (user_id, isbn13) DO NOTHING;
            """, (user_id, isbn13))

            connection.commit()
            cursor.close()
            connection.close()

            return jsonify({"message": f"Book with ISBN13 {isbn13} liked by user {user_id}."}), 201

        except Exception as e:
            print("An error occurred while liking the book:", e)
            return jsonify({"error": "An error occurred while liking the book", "message": str(e)}), 500


    elif request.method == 'DELETE': # New DELETE method
        try:
            isbn13 = request.json.get("isbn13")
            if not isbn13:
                return jsonify({"error": "ISBN13 is required to delete a like."}), 400

            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                DELETE FROM book_likes 
                WHERE CAST(user_id AS INTEGER) = %s AND isbn13 = %s;
            """, (user_id, isbn13))

            connection.commit()
            cursor.close()
            connection.close()

            return jsonify({"message": f"Like for book with ISBN13 {isbn13} deleted by user {user_id}."}), 200

        except Exception as e:
            print("An error occurred while deleting the book like:", e)
            return jsonify({"error": "An error occurred while deleting the book like", "message": str(e)}), 500
        
@app.route('/books/review/user/<int:userId>', methods=['GET', 'POST'])
def review_book(userId):
    if request.method == 'GET':
        try:
            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                SELECT b.isbn13, b.title, b.authors, b.categories, b.thumbnail, 
                       b.description, b.published_year, b.average_rating, b.num_pages, b.ratings_count,
                       br.rating
                FROM books b
                LEFT JOIN book_reviews br ON b.isbn13 = br.isbn13
                WHERE CAST(br.user_id AS INTEGER) = %s;
            """, (userId,))

            result = cursor.fetchall()

            if not result:
                return jsonify({"error": "No books found or no reviews available for this user"}), 404

            books_reviews = []
            for row in result:
                books_reviews.append({
                    "isbn13": row[0],
                    "title": row[1],
                    "authors": row[2],
                    "categories": row[3],
                    "thumbnail": row[4],
                    "description": row[5],
                    "published_year": row[6],
                    "average_rating": row[7],
                    "num_pages": row[8],
                    "ratings_count": row[9],
                    "user_rating": row[10]
                })

            cursor.close()
            connection.close()

            return jsonify({"user_id": userId, "reviews": books_reviews})

        except Exception as e:
            print("An error occurred while fetching books and reviews for user:", e)
            return jsonify({"error": "An error occurred while fetching books and reviews", "message": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            isbn13 = data.get('isbn13')
            rating = data.get('rating')

            if not isbn13 or not rating:
                return jsonify({"error": "ISBN and rating are required"}), 400

            connection = get_db_connection()
            cursor = connection.cursor()

            # Add or update the rating using ON CONFLICT
            cursor.execute("""
                INSERT INTO book_reviews (user_id, isbn13, rating)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, isbn13) 
                DO UPDATE SET rating = EXCLUDED.rating
                RETURNING (SELECT CASE WHEN xmax = 0 THEN 1 ELSE 0 END FROM books WHERE isbn13 = EXCLUDED.isbn13);
            """, (userId, isbn13, rating))

            is_new_row = cursor.fetchone()[0]

            if is_new_row:
                cursor.execute("""
                    UPDATE books 
                    SET ratings_count = ratings_count + 1
                    WHERE isbn13 = %s;
                """, (isbn13,))

            connection.commit()

            # Get updated book and rating information
            cursor.execute("""
                SELECT b.isbn13, b.title, b.authors, b.categories, b.thumbnail, 
                b.description, b.published_year, b.average_rating, b.num_pages, b.ratings_count,
                br.rating
                FROM books b
                LEFT JOIN book_reviews br ON b.isbn13 = br.isbn13
                WHERE br.user_id = %s AND b.isbn13 = %s;
            """, (userId, isbn13))  
            result = cursor.fetchone()

            cursor.close()
            connection.close()

            if result:
                book_review = {
                    "isbn13": result[0],
                    "title": result[1],
                    "authors": result[2],
                    "categories": result[3],
                    "thumbnail": result[4],
                    "description": result[5],
                    "published_year": result[6],
                    "average_rating": result[7],
                    "num_pages": result[8],
                    "ratings_count": result[9],
                    "user_rating": result[10]
                }
                return jsonify({"reviews": [book_review]}), 200
            else:
                return jsonify({"error": "Book not found"}), 404

        except Exception as e:
            print("An error occurred while submitting rating:", e)
            return jsonify({"error": "An error occurred while submitting rating", "message": str(e)}), 500


@app.route('/books/top-categories', methods=['GET'])
def get_top_categories():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        #Calculate the number of books by category and get the 5 categories with the most books
        cursor.execute("""
            SELECT categories, COUNT(*) AS book_count
            FROM books
            GROUP BY categories
            ORDER BY book_count DESC
            LIMIT 5;
        """)
        
        categories = cursor.fetchall()

        # Edit data from a database query
        top_categories = [{
            "category": category[0],
            "book_count": category[1]
        } for category in categories]

        cursor.close()
        connection.close()

        # Return results in JSON format
        return jsonify(top_categories)

    except Exception as e:
        print("An error occurred:", e)
        return jsonify({"error": "An error occurred", "message": str(e)}), 500

@app.route('/books/categories', methods=['GET'])
def get_all_categories():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # SQL query to retrieve categories
        cursor.execute("""
            SELECT DISTINCT categories
            FROM books
            WHERE categories IS NOT NULL AND categories != ''
            ORDER BY categories;
        """)
        
        categories = cursor.fetchall()
        
        # Return categories as a list

        category_list = [{"category": category[0]} for category in categories]

        cursor.close()
        connection.close()

        return jsonify(category_list)

    except Exception as e:
        print("An error occurred while fetching categories:", e)
        return jsonify({"error": "An error occurred", "message": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5005)