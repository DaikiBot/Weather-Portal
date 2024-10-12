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
def get_lightning_data():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        try:
            # Try to get the existing event loop, or create a new one if it doesn't exist
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        data = loop.run_until_complete(main(lat, lon))  # Run the async function
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
