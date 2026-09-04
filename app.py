from flask import Flask, render_template, request
from game import getGuessStatuses, getRandomWord, checkGuess

app = Flask(__name__, template_folder="template")
answer = getRandomWord()
guesses = []

@app.route("/", methods=["GET", "POST"])
def index():
    message = ""
    won = bool(guesses and guesses[-1]["word"] == answer)

    if request.method == "POST" and len(guesses) < 6:
        guess = request.form["guess"].lower()
        message = checkGuess(guess, answer)
        statuses = getGuessStatuses(guess, answer)
        if statuses is not None:
            guesses.append({"word": guess, "statuses": statuses})
            won = guess == answer

    game_over = won or len(guesses) >= 6
    if game_over and not won:
        message = f"Game over. The word was {answer.upper()}."

    return render_template(
        "index.html",
        guesses=guesses,
        message=message,
        game_over=game_over,
        won=won,
        answer=answer if game_over else ""
    )

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)