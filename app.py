from flask import Flask, render_template, request, redirect, session, url_for, flash
from db import get_db_connection
import bcrypt
import mysql.connector

app = Flask(__name__)
app.secret_key = 'secreta_ta'

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            if user['is_blocked']:
                flash('Account is blocked.', 'danger')
                return redirect(url_for('login'))

            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            flash('Logged in successfully!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'danger')

    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        dob = request.form['dob']

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO users (username, email, password, first_name, last_name, date_of_birth, is_verified, role)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'user')
            """, (username, email, hashed_password.decode('utf-8'), first_name, last_name, dob, True))
            conn.commit()
            flash('Account created successfully! You can now log in.', 'success')
            return redirect(url_for('login'))
        except mysql.connector.Error as err:
            flash(f'Error: {err}', 'danger')
        finally:
            cursor.close()
            conn.close()

    return render_template('register.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session.get('username'))

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
from flask import abort

# Decorator pentru acces doar admin
def admin_required(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            abort(403)
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# Lista jocuri
@app.route('/admin/games')
@admin_required
def admin_games():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM games")
    games = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('admin/games.html', games=games)

# Adăugare joc
@app.route('/admin/games/add', methods=['GET', 'POST'])
@admin_required
def add_game():
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        game_type = request.form['type']
        provider = request.form['provider']
        thumbnail = request.form['thumbnail']
        min_bet = request.form['min_bet']
        max_bet = request.form['max_bet']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO games (name, description, type, provider, thumbnail, min_bet, max_bet)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, description, game_type, provider, thumbnail, min_bet, max_bet))
        conn.commit()
        cursor.close()
        conn.close()
        flash('Game added successfully!', 'success')
        return redirect(url_for('admin_games'))

    return render_template('admin/add_game.html')

# Editare joc
@app.route('/admin/games/edit/<int:game_id>', methods=['GET', 'POST'])
@admin_required
def edit_game(game_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM games WHERE id = %s", (game_id,))
    game = cursor.fetchone()

    if not game:
        abort(404)

    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        game_type = request.form['type']
        provider = request.form['provider']
        thumbnail = request.form['thumbnail']
        min_bet = request.form['min_bet']
        max_bet = request.form['max_bet']

        cursor.execute("""
            UPDATE games SET name=%s, description=%s, type=%s, provider=%s, thumbnail=%s,
            min_bet=%s, max_bet=%s WHERE id=%s
        """, (name, description, game_type, provider, thumbnail, min_bet, max_bet, game_id))
        conn.commit()
        cursor.close()
        conn.close()
        flash('Game updated successfully!', 'success')
        return redirect(url_for('admin_games'))

    cursor.close()
    conn.close()
    return render_template('admin/edit_game.html', game=game)

# Ștergere joc
@app.route('/admin/games/delete/<int:game_id>')
@admin_required
def delete_game(game_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM games WHERE id = %s", (game_id,))
    conn.commit()
    cursor.close()
    conn.close()
    flash('Game deleted successfully!', 'success')
    return redirect(url_for('admin_games'))
# Listare utilizatori
@app.route('/admin/users')
@admin_required
def admin_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('admin/users.html', users=users)

# Editare utilizator
@app.route('/admin/users/edit/<int:user_id>', methods=['GET', 'POST'])
@admin_required
def edit_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        abort(404)

    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        phone = request.form['phone']
        role = request.form['role']
        is_verified = request.form.get('is_verified') == 'on'
        is_blocked = request.form.get('is_blocked') == 'on'

        cursor.execute("""
            UPDATE users SET first_name=%s, last_name=%s, phone=%s,
            role=%s, is_verified=%s, is_blocked=%s WHERE id=%s
        """, (first_name, last_name, phone, role, is_verified, is_blocked, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        flash('User updated successfully!', 'success')
        return redirect(url_for('admin_users'))

    cursor.close()
    conn.close()
    return render_template('admin/edit_user.html', user=user)

# Ștergere utilizator
@app.route('/admin/users/delete/<int:user_id>')
@admin_required
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    flash('User deleted successfully!', 'success')
    return redirect(url_for('admin_users'))
