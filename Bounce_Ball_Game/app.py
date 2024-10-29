from flask import Flask, render_template, request, jsonify,redirect
import sqlite3

app = Flask(__name__)

# Database setup
def init_db():
    conn = sqlite3.connect('leaderboard.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS leaderboard
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  score INTEGER NOT NULL)''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data['name']
    score = data['score']

    conn = sqlite3.connect('leaderboard.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("INSERT INTO leaderboard (name, score) VALUES (?, ?)", (name, score))
    conn.commit()
    conn.close()

    return redirect('/leaderboard_history')

@app.route('/leaderboard_history')
def leaderboard_history():
    conn = sqlite3.connect('leaderboard.db')
    conn.row_factory = sqlite3.Row
    leaderboard = conn.execute('SELECT * FROM leaderboard').fetchall()
    conn.close()
    return render_template('leaderboard.html', leaderboard=leaderboard)

@app.route('/clear_data', methods=['POST'])
def clear_data():
    conn = sqlite3.connect('leaderboard.db')
    conn.row_factory = sqlite3.Row
    conn.execute('DELETE FROM leaderboard') 
    conn.commit() 
    conn.close()
    return redirect('leaderboard_history')

if __name__ == '__main__':
    app.run(debug=True)
