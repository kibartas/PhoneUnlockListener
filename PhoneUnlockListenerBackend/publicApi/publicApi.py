#!/bin/python3

from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api", methods=["GET"])
def how_many_times():
    response = jsonify(open("../times.txt").read())
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == "__main__":
    app.run()
