# Bookwise

Bookwise is a web-based application to manage and discover books, with an added **AI-powered book recommendation system** that suggests books based on user preferences and reading history. The project consists of three main components:

- **Frontend**: React-based user interface
- **Backend**: Flask Restful API
- **Database**: PostgreSQL

The application is containerized using Docker.

## Features

- **View Books:** See books along with their details.
- **Category-based Book View:** View books filtered by selected categories.
- **Favorites:** Add books to your favorites list for quick access.
- **Ratings:** Rate books to provide feedback and help others.
- **User Account Management:** Change your username and password.
- **Account Deletion:** Permanently delete your account from the system.
- **Recommendations:** Based on the books you’ve rated, liked, and the categories you choose, you can activate the AI switch to get AI-powered book suggestions. Alternatively, you can view books directly from your selected categories.
- **Responsive UI:** Built with React for a seamless mobile and desktop experience.

## Getting Started

### Prerequisites

- Docker and Docker Compose must be installed on your system.

### Installation Steps

1. **Clone the repository:**

    ```bash
    git clone https://github.com/altasbatuhan/bookwise.git
    cd bookwise
    ```
2. **Start the Services with Docker Compose:**

This project uses Docker Compose to run all services together. To start the database, backend, and frontend services, run the following command:
   
   ```bash
    docker-compose up 
   ```

This command will automatically:

  Start the PostgreSQL Database (bookwise-db service).
  
  Start the Backend (bookwise-backend service), which will connect to the database.
  
  Start the Frontend (bookwise-frontend service), which will interact with the backend.
  
### Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:5000](http://localhost:5000)
- **PostgreSQL Database:** `localhost:5433` with username `postgres` and password `12345`


  ## Docker Images
  You can access the Docker images for the application via [Docker Hub](https://hub.docker.com/).
        
   - **Frontend Image:** [altasbatuhan/bookwise-frontend](https://hub.docker.com/r/altasbatuhan/bookwise-frontend)
   - **Backend Image:** [altasbatuhan/bookwise-backend](https://hub.docker.com/r/altasbatuhan/bookwise-backend)
  - **Database Image:** [altasbatuhan/bookwise-database](https://hub.docker.com/r/altasbatuhan/bookwise-database)        


