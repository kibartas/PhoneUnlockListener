#!/bin/python3

from flask import Flask, jsonify

app = Flask(__name__)

@app.post("/api/increase")
def increase():
    try:
        times_file = open("../times.txt", "r")
        num = times_file.read().strip()
        times_file.close()
        x = str(int(num) + 1)
        times_file = open("../times.txt", "w")
        times_file.write(x)
        times_file.close()
    except Exception as e:
        return jsonify(e)
    return x

@app.post("/api/reset")
def reset():
    try:
        times_file = open("../times.txt", "w")
        times_file.write("0")
        times_file.close()
    except Exception as e:
        return "Bad"
    return "OK!"
@app.get("/api")
def how_many_times():
    response = jsonify(open("../times.txt").read())
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    app.run()
