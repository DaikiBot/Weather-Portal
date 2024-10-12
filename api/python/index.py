from quart import Quart, request, jsonify
import asyncio
import weatherbug_spark
import json

app = Quart(__name__)

def serialize_strike(strike):
    return {
        "latitude": strike.latitude,
        "longitude": strike.longitude,
        "timestamp": strike.dateTimeLocalStr,
    }

async def get_weather_data(lat, lon):
    try:
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
    except Exception as e:
        return {"error": str(e)}

@app.route("/get-lightning-data", methods=["GET"])
async def get_lightning_data():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        data = await get_weather_data(lat, lon)  # Async call with Quart
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
