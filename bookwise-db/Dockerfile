FROM postgres:17

COPY bookwise_backup.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=12345
ENV POSTGRES_DB=bookwise

