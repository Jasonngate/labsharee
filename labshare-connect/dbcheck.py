from sqlalchemy import create_engine, text

# Your Render Postgres connection URL
DATABASE_URL = "postgresql://labshare_db_user:OYByk5CnT0VmkhDcCbu8mzrpgX6BUCDc@dpg-d29l6c49c44c73eq5bo0-a.oregon-postgres.render.com/labshare_db"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Query to get column names for 'upload' table
query = text("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'upload';
""")

with engine.connect() as conn:
    result = conn.execute(query)
    columns = [row[0] for row in result]

print("Columns in 'upload' table:", columns)
