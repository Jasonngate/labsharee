from app import app, db, Upload

with app.app_context():
    upload = Upload(
        filename="example.jpg",
        filepath="https://res.cloudinary.com/demo/image/upload/example.jpg",
        filetype="image",
        mimetype="image/jpeg"
    )
    db.session.add(upload)
    db.session.commit()
    print("✅ Example upload added to DB.")
