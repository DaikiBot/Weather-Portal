import asyncio
import weatherbug_spark
import json

def serialize_strike(strike):
    return {
        "latitude": strike.latitude,
        "longitude": strike.longitude,
        "timestamp": strike.dateTimeLocalStr,
        # Remove "timestamp" or replace it with the correct attribute if available.
    }

async def main(lat, lon):
    data = await weatherbug_spark.get_data(lat=lat, lon=lon)

    if data.pulseListAlert:
        print("Attributes of LightningStrike object:", dir(data.pulseListAlert[0]))

    pulseListAlert = [serialize_strike(strike) for strike in data.pulseListAlert]

    result = {
        "pulseListAlert": pulseListAlert,
        "shortMessage": data.shortMessage,
        "safetyMessage": data.safetyMessage,
        "alertColor": data.alertColor,
        "closestPulseDistance": data.closestPulseDistance
    }

    print(json.dumps(result))

if __name__ == "__main__":
    import sys
    lat = float(sys.argv[1])
    lon = float(sys.argv[2])
    asyncio.run(main(lat, lon))
