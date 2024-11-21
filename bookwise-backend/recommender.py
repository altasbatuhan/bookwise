import pandas as pd
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os 

class BookRecommender:
    def __init__(self):
        self.df = None
        self.tfidf_matrix = None
        self.similarity_matrix = None
        self.user_ratings = {}
        
    def prepare_data(self, df):
        """Prepare the dataset for recommendation."""
        self.df = df.copy()
        
        # Ensure categories is a list or set for each book
        self.df['categories'] = self.df['categories'].fillna('').str.split(',')
        
        # Combine text features into a single string
        self.df['text_features'] = self.df['title'].fillna('') + ' ' + \
                                 self.df['subtitle'].fillna('') + ' ' + \
                                 self.df['authors'].fillna('') + ' ' + \
                                 self.df['description'].fillna('')
        
        # Fill missing values for numerical features with mean or median
        self.df['published_year'] = self.df['published_year'].fillna(self.df['published_year'].median())
        self.df['average_rating'] = self.df['average_rating'].fillna(self.df['average_rating'].mean())

        # Normalize numerical features
        scaler = MinMaxScaler()
        self.df['norm_year'] = scaler.fit_transform(self.df[['published_year']].fillna(0))
        self.df['norm_rating'] = scaler.fit_transform(self.df[['average_rating']].fillna(0))

    def add_user_rating(self, user_id, isbn13, rating):
        """Add or update a user's rating for a book, if the ISBN exists in the dataset."""
        # Check if the ISBN exists in the dataset
        if isbn13 not in self.df['isbn13'].values:
            print(f"Warning: ISBN {isbn13} does not exist in the dataset. Rating not added.")
            return  # Exit the function if ISBN doesn't exist
    
        # If the ISBN exists, proceed to add or update the rating
        if user_id not in self.user_ratings:
            self.user_ratings[user_id] = {}
        self.user_ratings[user_id][isbn13] = rating

    def get_user_rated_books_in_category(self, user_id, category):
        """Get books rated by user in a specific category."""
        if user_id not in self.user_ratings:
            return []
        
        rated_books = []
        for isbn13, rating in self.user_ratings[user_id].items():
            book_idx = self.df[self.df['isbn13'] == isbn13].index
            if len(book_idx) > 0:
                book_idx = book_idx[0]
                book_categories = self.df.iloc[book_idx]['categories']
                if category in book_categories:
                    rated_books.append((isbn13, rating, book_idx))
        
        return rated_books

    def create_feature_matrix(self):
        """Create TF-IDF matrix from text features."""
        tfidf = TfidfVectorizer(stop_words='english', 
                               max_features=5005,
                               ngram_range=(1, 2))
        
        # Create text feature matrix
        self.tfidf_matrix = tfidf.fit_transform(self.df['text_features'])
        
        # Add numerical features
        numerical_features = np.column_stack((
            self.df['norm_year'],
            self.df['norm_rating']
        ))
        
        # Combine text and numerical features
        self.feature_matrix = np.hstack((
            self.tfidf_matrix.toarray(),
            numerical_features
        ))
        
    def calculate_similarity(self):
        """Calculate similarity matrix using cosine similarity."""
        self.similarity_matrix = cosine_similarity(self.feature_matrix)
        
    def get_available_categories(self):
        """Get list of all unique categories in the dataset."""
        all_categories = set()
        for cats in self.df['categories']:
            all_categories.update(cats)
        return sorted(list(all_categories))
        
    def get_recommendations(self, book_indices, n_recommendations=15):
        """Get book recommendations based on similarity to multiple books."""
        # If we have multiple books, combine their similarity scores
        if isinstance(book_indices, list):
            sim_scores = np.zeros(len(self.similarity_matrix))
            for idx in book_indices:
                sim_scores += self.similarity_matrix[idx]
            sim_scores /= len(book_indices)  # Average the scores
        else:
            sim_scores = self.similarity_matrix[book_indices]
        
        # Convert to list of tuples (index, score)
        sim_scores = list(enumerate(sim_scores))
        
        # Sort books by similarity score
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Remove books that were in the input indices
        if isinstance(book_indices, list):
            sim_scores = [(i, score) for i, score in sim_scores if i not in book_indices]
        else:
            sim_scores = sim_scores[1:]  # Skip the first book (itself)
        
        # Get top N recommendations
        sim_scores = sim_scores[:n_recommendations]
        book_indices = [i[0] for i in sim_scores]
        
        # Return recommended books with similarity scores
        recommendations = self.df.iloc[book_indices][
            ['isbn13', 'title', 'authors', 'categories', 'average_rating', 'thumbnail', 'description']
        ].copy()
        recommendations['similarity_score'] = [i[1] for i in sim_scores]
        
        return recommendations

    def recommend_books(self, user_id, category, n_recommendations=30):
        """Main recommendation function that combines user ratings and content-based approach."""
        # First, check if user has rated any books in the category
        rated_books = self.get_user_rated_books_in_category(user_id, category)
        
        # Filter books by category
        category_mask = self.df['categories'].apply(lambda x: category in x)
        self.df_filtered = self.df[category_mask].copy()
        
        if rated_books:
            # Use rated books as basis for recommendations
            rated_indices = [book[2] for book in rated_books]
            # Get recommendations based on rated books
            recommendations = self.get_recommendations(rated_indices, n_recommendations)
            recommendations['recommendation_basis'] = 'Based on your ratings'
        else:
            # Use top-rated books in category as fallback
            top_book_idx = self.df_filtered.sort_values('average_rating', ascending=False).index[0]
            recommendations = self.get_recommendations(top_book_idx, n_recommendations)
            recommendations['recommendation_basis'] = 'Based on popular books in category'
            
        return recommendations

    def fit(self, df):
        """Fit the recommender system to the data."""
        self.prepare_data(df)
        self.create_feature_matrix()
        self.calculate_similarity()


load_dotenv()

# PostgreSQL database connection
def get_data_from_postgresql():
    # Get the DATABASE_URL from the .env file
    database_url = os.getenv("DATABASE_URL")
    
    # Set up your PostgreSQL connection details
    engine = create_engine(database_url)
    
    # Fetch data from the database
    query = "SELECT * FROM books"
    df = pd.read_sql(query, engine)
    
    return df

# Fetch data from PostgreSQL
df = get_data_from_postgresql()

# Initialize and fit the recommender
recommender = BookRecommender()
recommender.fit(df)


# # Get recommendations for a user in a specific category
# 
# print(recommendations)
