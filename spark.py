import weatherbug_spark
import json

def serialize_strike(strike):
    return {
        "latitude": strike.latitude,
        "longitude": strike.longitude,
        "timestamp": strike.dateTimeLocalStr,
    }

def main(lat, lon):
    data = weatherbug_spark.get_data_sync(lat=lat, lon=lon)  # Assuming `get_data_sync()` is the sync version

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
    main(lat, lon)
