from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()

# ==========================================================
#  MODELO USUARIO
# ==========================================================
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # Relación con los platos favoritos
    favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        """Guarda la contraseña de forma segura (hash)."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica si la contraseña coincide con el hash almacenado."""
        return check_password_hash(self.password_hash, password)

    def to_dict_basic(self):
        """Versión resumida del usuario (sin favoritos ni contraseña)."""
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "email": self.email,
            "password": self.password_hash
        }

    def to_dict(self, include_favorites=False):
        """Versión completa, opcionalmente con favoritos."""
        data = self.to_dict_basic()
        if include_favorites:
            data["favorites"] = [fav.dish.to_dict_basic() for fav in self.favorites]
        return data


# ==========================================================
#  MODELO PLATO (Dish)
# ==========================================================
class Dish(db.Model):
    __tablename__ = "dish"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)

    # Relación inversa a favoritos
    favorites = db.relationship("Favorite", back_populates="dish", cascade="all, delete-orphan")

    def to_dict_basic(self):
        """Versión simple del plato."""
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "description": self.description,
            "image": self.image
        }

    def to_dict(self):
        """Versión completa (igual que la básica por ahora, pero se puede extender)."""
        return self.to_dict_basic()


# ==========================================================
#  MODELO FAVORITO (relación User ↔ Dish)
# ==========================================================
class Favorite(db.Model):
    __tablename__ = "favorite"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    dish_id = db.Column(db.Integer, db.ForeignKey("dish.id"), nullable=False)

    # Relaciones
    user = db.relationship("User", back_populates="favorites")
    dish = db.relationship("Dish", back_populates="favorites")

    def to_dict(self):
        """Devuelve la relación user-dish en formato JSON."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "dish": self.dish.to_dict_basic()
        }