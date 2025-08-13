import os
from collections import defaultdict
from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from PIL import Image, ImageStat
import imghdr

# -------------------- ENV & APP SETUP --------------------
load_dotenv()

app = Flask(
    __name__,
    static_folder=os.path.join("backend", "static"),
    static_url_path=""
)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")
CORS(app, supports_credentials=True)
limiter = Limiter(get_remote_address, app=app, default_limits=["30 per 10 minutes"])

# -------------------- DATABASE --------------------
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Upload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    batch = db.Column(db.String(10))
    subject = db.Column(db.String(100), nullable=False)
    experiment = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    public_id = db.Column(db.String(255), nullable=True)

with app.app_context():
    db.create_all()

# -------------------- CLOUDINARY --------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET"),
    secure=True
)

# -------------------- ADMIN --------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# -------------------- FILE VALIDATION --------------------
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg', 'py', 'ipynb', 'txt'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file):
    """Reject memes, selfies, or random photos using heuristics."""
    try:
        file.seek(0)
        img = Image.open(file)
        img.verify()
        file.seek(0)
        img = Image.open(file).convert("RGB")

        width, height = img.size
        if width < 400 or height < 400:
            return False  # too small

        colors = len(img.getcolors(maxcolors=1000000) or [])
        if colors > 100000:  # too many colors
            return False

        stat = ImageStat.Stat(img)
        brightness = sum(stat.mean) / 3
        if brightness < 50 or brightness > 220:
            return False

        ratio = width / height
        if ratio < 0.5 or ratio > 2:
            return False

        return True
    except Exception:
        return False

def validate_file(file):
    ext = file.filename.rsplit('.', 1)[1].lower()
    file.seek(0)
    content = file.read()
    file.seek(0)

    if ext == 'pdf':
        if not content.startswith(b'%PDF'):
            return False
    elif ext in {'png', 'jpg', 'jpeg'}:
        if not validate_image(file):
            return False
    elif ext in {'py', 'txt', 'ipynb', 'docx'}:
        return True
    else:
        return False

    return True

def get_category(file):
    ext = file.filename.rsplit('.', 1)[1].lower()
    if ext in {'pdf', 'png', 'jpg', 'jpeg', 'docx'}:
        return 'writeups'
    elif ext in {'py', 'ipynb', 'txt'}:
        return 'code'
    return 'other'

# -------------------- ROUTES --------------------

@app.route("/api/test")
def api_test():
    return jsonify({"message": "Backend is working!"})

@app.route('/upload', methods=['POST'])
def upload_file():
    subject = request.form.get('subject')
    experiment = request.form.get('expno')
    batch = request.form.get('batch')

    rubric = request.files.get('rubric')
    output = request.files.get('output')
    code = request.files.get('code')

    if not subject or not experiment:
        return jsonify({"error": "Subject and Experiment are required."}), 400

    saved_files = []
    files = {'rubric': rubric, 'output': output, 'code': code}

    for key, file in files.items():
        if file and file.filename != '':
            if not allowed_file(file.filename):
                return jsonify({"error": f"Unsupported file type: {file.filename}"}), 400

            file.seek(0, 2)
            file_size = file.tell()
            file.seek(0)
            if file_size > MAX_FILE_SIZE:
                return jsonify({"error": f"{file.filename} exceeds max allowed size of 5 MB."}), 400

            if not validate_file(file):
                return jsonify({"error": f"Invalid or unsupported file content: {file.filename}"}), 400

            category = get_category(file)
            original_filename = secure_filename(file.filename)
            prefixed_filename = f"{category}_{original_filename}"

            try:
                result = cloudinary.uploader.upload(file, resource_type="auto", public_id=prefixed_filename)

                upload = Upload(
                    batch=batch,
                    subject=subject,
                    experiment=experiment,
                    category=category,
                    filename=prefixed_filename,
                    url=result['secure_url'],
                    public_id=prefixed_filename
                )
                db.session.add(upload)
                saved_files.append(prefixed_filename)
            except Exception as e:
                return jsonify({"error": f"Failed to upload {file.filename}: {str(e)}"}), 500

    if saved_files:
        db.session.commit()
        return jsonify({"message": f"Uploaded {len(saved_files)} file(s) successfully."}), 200
    else:
        return jsonify({"error": "No valid files uploaded."}), 400

@app.route('/view', methods=['GET'])
def view_files():
    uploads = Upload.query.all()
    data = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    for item in uploads:
        category = item.category
        if category == "rubric":
            category = "writeups"
        display_filename = item.filename.replace("rubric_", "writeup_")
        data[item.subject][item.experiment][category].append((display_filename, item.url))
    return jsonify(data), 200

@app.route('/admin', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        session['admin'] = True
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    uploads = Upload.query.order_by(Upload.id.desc()).all()
    return jsonify([{
        "id": u.id,
        "batch": u.batch,
        "subject": u.subject,
        "experiment": u.experiment,
        "category": u.category,
        "filename": u.filename,
        "url": u.url
    } for u in uploads]), 200

@app.route('/admin/delete/<int:file_id>', methods=['DELETE'])
def admin_delete_file(file_id):
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403

    file = Upload.query.get_or_404(file_id)
    try:
        public_id = file.public_id or file.filename.rsplit('.', 1)[0]
        cloudinary.uploader.destroy(public_id, resource_type="raw")
    except Exception as e:
        return jsonify({"error": f"Cloudinary deletion failed: {str(e)}"}), 500

    db.session.delete(file)
    db.session.commit()
    return jsonify({"message": f"Deleted {file.filename} successfully."}), 200

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return jsonify({"message": "Logged out"}), 200

# -------------------- REACT FRONTEND ROUTING --------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")

# -------------------- ENTRY POINT --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
