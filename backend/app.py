# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 简单健康检查
    @app.get("/api/hello")
    def hello():
        return jsonify({"message": "Hello from Flask!"})

    # 注册搜索蓝图
    from routes.search_proxy import bp as search_bp
    app.register_blueprint(search_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
