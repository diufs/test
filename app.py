import os

from flask import Flask, jsonify, request, abort, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)

flats = [
    {
        'id': 1,
        'title': 'Светлая квартира на набережной',
        'location': 'Центр, Москва',
        'price': 18900000,
        'area': 72,
        'rooms': 3,
        'image': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        'description': 'Уютная квартира с видом на реку, большая кухня и современный ремонт.',
    },
    {
        'id': 2,
        'title': 'Стильная студия в новом доме',
        'location': 'Смоленская',
        'price': 8500000,
        'area': 34,
        'rooms': 1,
        'image': 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
        'description': 'Идеальный вариант для одного человека или молодой пары.',
    },
]


@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


@app.route('/flats', methods=['GET'])
def get_flats():
    """Возвращает список всех квартир."""
    return jsonify(flats)


@app.route('/flat/<int:flat_id>', methods=['GET'])
def get_flat(flat_id):
    """Возвращает одну квартиру по id."""
    flat = next((item for item in flats if item['id'] == flat_id), None)
    if flat is None:
        abort(404, description='Квартира не найдена')
    return jsonify(flat)


@app.route('/flat', methods=['POST'])
def create_flat():
    """Создает новую квартиру из JSON-запроса."""
    data = request.get_json(silent=True)
    if not data or 'title' not in data or 'price' not in data:
        abort(400, description='Требуются поля title и price')

    new_id = max((item['id'] for item in flats), default=0) + 1
    new_flat = {
        'id': new_id,
        'title': data['title'],
        'location': data.get('location', 'Не указано'),
        'price': data['price'],
        'area': data.get('area', 0),
        'rooms': data.get('rooms', 0),
        'image': data.get('image', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'),
        'description': data.get('description', 'Описание будет добавлено позже.'),
    }
    flats.insert(0, new_flat)
    return jsonify(new_flat), 201


if __name__ == '__main__':
    app.run(debug=True, port=5000)
