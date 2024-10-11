from flask import Flask, request, jsonify
import asyncio
import weatherbug_spark
import json

app = Flask(__name__)

def serialize_strike(strike):
    return {
        "latitude": strike.latitude,
        "longitude": strike.longitude,
        "timestamp": strike.dateTimeLocalStr,
    }

async def main(lat, lon):
    data = await weatherbug_spark.get_data(lat=lat, lon=lon)

    pulseListAlert = [serialize_strike(strike) for strike in data.pulseListAlert]

    result = {
        "pulseListAlert": pulseListAlert,
        "shortMessage": data.shortMessage,
        "safetyMessage": data.safetyMessage,
        "alertColor": data.alertColor,
        "closestPulseDistance": data.closestPulseDistance
    }

    return result

@app.route("/get-lightning-data", methods=["GET"])
def get_lightning_data():
    lat = float(request.args.get("lat"))
    lon = float(request.args.get("lon"))
    data = asyncio.run(main(lat, lon))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
