import random
from pathlib import Path

import requests

url = "https://random-word-api.herokuapp.com/word?length=5"

wordlist = sorted(set([
    "apple", "beach", "blaze", "brave", "bread", "brick", "cabin", "candy",
    "chair", "charm", "chase", "cloud", "crown", "dance", "dream", "eagle",
    "earth", "flame", "flash", "flute", "fruit", "giant", "globe", "grape",
    "grass", "green", "heart", "honey", "house", "jelly", "knife", "lemon",
    "light", "magic", "maple", "metal", "money", "mouse", "music", "ocean",
    "olive", "orbit", "otter", "panda", "peach", "pearl", "piano", "pilot",
    "plant", "plaza", "pride", "queen", "quiet", "raven", "river", "robot",
    "robin", "rough", "round", "royal", "scale", "scarf", "shark", "sheep",
    "shine", "shore", "skate", "skull", "slate", "smile", "snail", "snake",
    "spice", "spoon", "sport", "stack", "steam", "stone", "storm", "sugar",
    "table", "tiger", "toast", "token", "tower", "train", "treat", "truck",
    "tulip", "uncle", "vivid", "whale", "wheat", "world", "zebra"
]))

word_file = Path(__file__).with_name("five_letter_words.txt")
if word_file.exists():
    wordlist.extend(word_file.read_text(encoding="ascii").splitlines())
wordlist = sorted(set(
    word.lower().strip()
    for word in wordlist
    if len(word.strip()) == 5 and word.strip().isalpha()
))




def getRandomWord():
    online_url = "https://random-word-api.herokuapp.com/word?length=5"

    try:
        response = requests.get(online_url, timeout=3)
        response.raise_for_status()
        online_word = response.json()[0].strip().lower()
        if len(online_word) == 5 and online_word.isalpha():
            if online_word not in wordlist:
                wordlist.append(online_word)
            return online_word
    except (requests.RequestException, IndexError, TypeError, ValueError):
        pass

    return random.choice(wordlist)



def getGuessStatuses(guess, answer):
    if len(guess) != len(answer) or guess not in wordlist:
        return None

    statuses = ["absent"] * len(guess)
    remaining_letters = list(answer)

    for index, letter in enumerate(guess):
        if letter == answer[index]:
            statuses[index] = "correct"
            remaining_letters[index] = None

    for index, letter in enumerate(guess):
        if statuses[index] == "correct":
            continue
        if letter in remaining_letters:
            statuses[index] = "present"
            remaining_letters[remaining_letters.index(letter)] = None

    return statuses


def checkGuess(guess, answer):
    if len(guess) != len(answer): return f"Your guess must be {len(answer)} letters long."
    
    elif guess == answer: return "Congratulations! You've guessed the word correctly!"
    
    elif len(guess) == len(answer):
        if guess not in wordlist:
            return "Your guess is not a valid word. Please try again."
        correct_positions = []
        correct_letters = []
        for i in range(len(guess)):
            
            if guess[i] == answer[i]:
                correct_positions.append(guess[i])
            elif guess[i] in answer:
                correct_letters.append(guess[i])
        
        if correct_positions or correct_letters:
            
            return f"Correct letters in the correct position: {', '.join(correct_positions)}. Correct letters in the wrong position: {', '.join(correct_letters)}."
        
        
        return "No letters are in the correct position."
    
    return "Incorrect guess. Try again."


def game():
    print("Welcome to the Wordle game!")
    print("You have to guess a 5-letter word.")
    print("After each guess, you'll get feedback on your guess.")
    print("Type 'exit' to quit the game.")
    answer = getRandomWord()
    
    for _ in range(6): 
        guess = input("Enter your guess: ")
        if guess == 'exit':
            print("Exiting the game.")
            break
        result = checkGuess(guess, answer)
        print(result)
        
    print(f"The correct word was: {answer}")


if __name__ == "__main__":
    game()
    
    