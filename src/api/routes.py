from flask import request, jsonify, Blueprint
from api.models import db, User, Dish  
from api.utils import APIException
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

api = Blueprint('api', __name__)



# =========================
# 🔐 AUTENTICACIÓN
# =========================

@api.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not all([name, username, email, password]):
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"msg": "El usuario o correo ya existen"}), 409

    try:
        user = User(name=name, username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # 👇 Mientras desarrollas, exponemos el detalle para ver el error real
        return jsonify({"msg": "Error creando usuario", "detail": str(e)}), 500

    token = create_access_token(identity=user.id)
    return jsonify({"user": user.to_dict(include_favorites=True), "access_token": token}), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"user": user.to_dict(include_favorites=True), "access_token": token}), 200


# =========================
# 👤 PERFIL DE USUARIO
# =========================

@api.route("/me", methods=["GET"])
@jwt_required()
def get_user_data():
    """Devuelve los datos del usuario y sus favoritos"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict(include_favorites=True)), 200


@api.route("/user/update", methods=["PUT"])
@jwt_required()
def update_user():
    """Permite modificar nombre, usuario, email o contraseña"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    for field in ["name", "username", "email"]:
        if field in data and data[field]:
            setattr(user, field, data[field])

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"msg": "Usuario actualizado", "user": user.to_dict(include_favorites=True)}), 200


# =========================
# 🍜 CARTA DE PLATOS
# =========================

@api.route("/dishes", methods=["GET"])
def get_all_dishes():
    dishes = Dish.query.all()
    return jsonify([dish.to_dict() for dish in dishes]), 200


@api.route("/dishes", methods=["POST"])
def create_dish():
    data = request.get_json()
    dish = Dish(
        name=data.get("name"),
        price=data.get("price"),
        description=data.get("description"),
        image_url=data.get("image_url")
    )
    db.session.add(dish)
    db.session.commit()
    return jsonify(dish.to_dict()), 201


@api.route("/dishes/<int:dish_id>", methods=["DELETE"])
def delete_dish(dish_id):
    dish = Dish.query.get(dish_id)
    if not dish:
        return jsonify({"msg": "Plato no encontrado"}), 404
    db.session.delete(dish)
    db.session.commit()
    return jsonify({"msg": "Plato eliminado"}), 200


# =========================
# ❤️ FAVORITOS
# =========================

@api.route("/favorites", methods=["GET"])
@jwt_required()
def list_favorites():
    """Devuelve la lista de platos favoritos del usuario logueado"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.get_favorites()), 200


@api.route("/favorites/<int:dish_id>", methods=["POST"])
@jwt_required()
def toggle_favorite(dish_id):
    """Añade o elimina un plato de los favoritos"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    dish = Dish.query.get(dish_id)

    if not dish:
        return jsonify({"msg": "Plato no encontrado"}), 404

    if dish in user.favorites:
        user.favorites.remove(dish)
        msg = "Plato eliminado de favoritos"
    else:
        user.favorites.append(dish)
        msg = "Plato añadido a favoritos"

    db.session.commit()
    return jsonify({"msg": msg, "favorites": user.get_favorites()}), 200
