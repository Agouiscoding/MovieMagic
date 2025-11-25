# backend/app.py
from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path
from flask_cors import CORS
from db import init_db
from dotenv import load_dotenv


def create_app():
    app = Flask(__name__)
    # ... 其他初始化
    app.register_blueprint(trending_bp)
    return app

def create_app():
    app = Flask(__name__)
    # Load environment variables from backend/.env explicitly
    load_dotenv(dotenv_path=Path(__file__).parent / ".env")
    CORS(app)
    # Initialize database tables
    init_db()

    # 简单健康检查
    @app.get("/api/hello")
    def hello():
        return jsonify({"message": "Hello from Flask!"})

    # 注册搜索蓝图
    # 注册搜索和发现蓝图（只注册一次）
    from routes.search_proxy import bp as search_bp
    from routes.discovery_proxy import bp as discover_bp
    from routes.user import bp as user_bp
    from routes.trending import bp as trending_bp
    from routes.details import bp as details_bp
    from routes.media import bp as media_bp
    from routes.comments import bp as comments_bp

    app.register_blueprint(search_bp)
    app.register_blueprint(discover_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(trending_bp)
    app.register_blueprint(details_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(comments_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
