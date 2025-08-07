import os
from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from werkzeug.utils import secure_filename
from collections import defaultdict
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

# ✅ Load environment variables
load_dotenv()

# ✅ Dynamically resolve the absolute path to backend/static
basedir = os.path.abspath(os.path.dirname(__file__))
static_path = os.path.join(basedir, 'backend', 'static')

app = Flask(__name__, static_folder=static_path, static_url_path='')


# ✅ Secret key from .env
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key")

# ✅ CORS for React (production: restrict origins)
CORS(app, supports_credentials=True)

# ✅ Rate Limiting
limiter = Limiter(get_remote_address, app=app, default_limits=["30 per 10 minutes"])

# ✅ SQLAlchemy Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ✅ Cloudinary Config
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET"),
    secure=True
)

# ✅ Admin Credentials
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'vo@13w3sedr54fwf'

# ✅ Allowed File Types
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg', 'py', 'ipynb', 'txt'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ DB Model
class Upload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    batch = db.Column(db.String(10))
    subject = db.Column(db.String(100), nullable=False)
    experiment = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=False)

# ✅ API Routes

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

    for category, file in files.items():
        if file and file.filename != '' and allowed_file(file.filename):
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
                    url=result['secure_url']
                )
                db.session.add(upload)
                saved_files.append(prefixed_filename)
            except Exception as e:
                return jsonify({"error": f"Failed to upload {file.filename}: {str(e)}"}), 500
        elif file and file.filename != '':
            return jsonify({"error": f"Unsupported file type: {file.filename}"}), 400

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
        data[item.subject][item.experiment][item.category].append((item.filename, item.url))

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
        public_id = file.filename.rsplit('.', 1)[0]
        cloudinary.uploader.destroy(public_id, resource_type="auto")
    except Exception as e:
        return jsonify({"error": "Cloudinary deletion failed"}), 500

    db.session.delete(file)
    db.session.commit()
    return jsonify({"message": f"Deleted {file.filename} successfully."}), 200

@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return jsonify({"message": "Logged out"}), 200

# Server react front end
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')



# ✅ DB Init
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

