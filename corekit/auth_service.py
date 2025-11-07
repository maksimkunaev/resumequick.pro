# auth_service.py - Authentication and user management
from functools import wraps
import os
from flask import Blueprint, request, jsonify, g, current_app
from firebase_admin import auth, firestore
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

DAILY_FREE_CREDITS = int(os.getenv("DAILY_FREE_CREDITS"))

# Create blueprint
auth_bp = Blueprint("auth", __name__)


def get_db():
    """Get database instance from app config"""
    return current_app.config["db"]


def get_daily_free_credits():
    """Get daily free credits from app config"""
    return current_app.config["DAILY_FREE_CREDITS"]


def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            token = request.headers.get("Authorization", "").split(" ")[1]
            decoded = auth.verify_id_token(token)
            g.user_id = decoded["uid"]
        except (IndexError, AttributeError):
            return jsonify({"error": "Missing or invalid authorization header"}), 401
        except auth.InvalidIdTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            print("❌ Auth error:", e)
            return jsonify({"error": "Authentication service unavailable"}), 503
        return f(*args, **kwargs)

    return decorated_function


def refresh_daily_credits(user_ref, user_data):
    """Refresh daily free credits if 24h have passed"""
    now = datetime.now(timezone.utc)
    last_reset = user_data.get("free_last_reset")

    # If no last_reset or more than 24h passed
    if not last_reset or (now - last_reset.replace(tzinfo=timezone.utc)).days >= 1:
        user_ref.update({"free_used": 0, "free_last_reset": now})
        return True
    return False


def get_available_credits(user_data):
    """Calculate total available credits - unlimited usage"""
    # Return a very large number instead of infinity for JSON compatibility
    return DAILY_FREE_CREDITS  # Effectively unlimited credits


def deduct_credits(user_ref, user_data, credits_needed):
    """Track credit usage but don't limit - unlimited usage"""
    # Always allow usage, just track for analytics
    free_used = user_data.get("free_used", 0)

    # Update usage counter for analytics but don't limit
    new_free_used = free_used + credits_needed

    # Update database with usage tracking
    user_ref.update(
        {
            "free_used": new_free_used,
        }
    )

    return {
        "credits_used": credits_needed,
        "free_used": credits_needed,
        "paid_used": 0,
        "new_free_used": new_free_used,
        "new_paid_credits": 0,
    }


# Keep the old deduct_credit function for backward compatibility
def deduct_credit(user_ref, user_data):
    """Deduct 1 credit (backward compatibility)"""
    return deduct_credits(user_ref, user_data, 1)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    try:
        print("🆕 Регистрация пользователя")
        token = request.headers.get("Authorization", "").split(" ")[1]
        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]
        email = decoded.get("email", "no-email")

        db = get_db()
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            print(f"✅ Пользователь {uid} уже существует")
            return jsonify({"message": "User already exists"}), 200

        # Updated user structure with new credits system
        now = datetime.now(timezone.utc)
        user_ref.set(
            {
                "plan": "free",
                "free_limit": get_daily_free_credits(),
                "free_used": 0,
                "free_last_reset": now,
                "paid_credits": 0,
                "email": email,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

        print(f"✅ Новый пользователь {uid} создан")
        return jsonify({"message": "User registered"}), 201

    except (IndexError, AttributeError):
        return jsonify({"error": "Missing or invalid authorization header"}), 401
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print("❌ Register error:", e)
        return jsonify({"error": "Service temporarily unavailable"}), 503


@auth_bp.route("/auth/me", methods=["GET"])
@auth_required
def get_user_info():
    try:
        uid = g.user_id
        db = get_db()
        user_ref = db.collection("users").document(uid)
        doc = user_ref.get()

        if not doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = doc.to_dict()

        # Refresh daily credits if needed
        credits_refreshed = refresh_daily_credits(user_ref, user_data)
        if credits_refreshed:
            # Re-fetch updated data
            doc = user_ref.get()
            user_data = doc.to_dict()

        available_credits = get_available_credits(user_data)

        response_data = {
            "free_limit": user_data.get("free_limit", get_daily_free_credits()),
            "free_used": user_data.get("free_used", 0),
            "paid_credits": user_data.get("paid_credits", 0),
            "total_available": available_credits,
            "credits_refreshed": credits_refreshed,
        }

        print(f"AUTH ME: {uid}, Available credits: {available_credits}")
        return jsonify(response_data)

    except Exception as e:
        print("❌ Get user info error:", e)
        return jsonify({"error": "Database service unavailable"}), 503
