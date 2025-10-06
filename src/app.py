import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False

# ----- Config DB
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ----- Config JWT
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"  # cámbiala por una segura en prod
jwt = JWTManager(app)

# ----- CORS (aplica a /api/*)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:3002",
                "http://localhost:3002",
                "https://*.app.github.dev",  # Codespaces
                "https://*.github.dev"
            ],
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        }
    },
)

# ----- Init extensiones
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# ----- Admin y comandos
setup_admin(app)
setup_commands(app)

# ----- Blueprints
app.register_blueprint(api, url_prefix='/api')

# ----- Rutas estáticas / sitemap
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
