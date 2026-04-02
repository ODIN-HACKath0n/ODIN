# mock_db.py

# Наша тимчасова "база даних" у пам'яті. 
# Ключем буде ім'я користувача (username), а значенням - словник з даними.
_users_db = {}

def get_user_by_username(username):
    """
    Імітує пошук користувача в базі даних.
    Повертає словник з даними користувача, якщо він існує, або None.
    """
    return _users_db.get(username)

def create_user(username, hashed_password):
    """
    Імітує створення нового запису в базі даних.
    """
    if username in _users_db:
        return False # Користувач вже існує

    # Створюємо імітацію унікального ID
    user_id = len(_users_db) + 1 
    
    user_data = {
        'id': user_id,
        'username': username,
        'password': hashed_password
    }
    
    # Зберігаємо в нашу тимчасову базу
    _users_db[username] = user_data
    return user_data

def get_all_users():
    """Допоміжна функція, щоб ви могли перевірити, що збереглося (для дебагу)"""
    return _users_db