import asyncio
import weatherbug_spark
import sys

async def main(lat, lon):
    data = await weatherbug_spark.get_data(lat=lat, lon=lon)

    # Get the local lightning strike locations
    print("Local Lightning Strike Locations: ", data.pulseListAlert)  # List of LightningStrike objects

    # Get the short message
    print("Safety Message Short: ", data.shortMessage)  # Monitor Storms

    # Get the long message
    print("Safety Message Long: ", data.safetyMessage)  # You are not in immediate danger now, but stay alert and frequently check WeatherBug...

    # Get the hex code for the color of the alert
    print("Alert Color: ", data.alertColor)  # #F0D701

    # Get the closest strike distance
    print("Closest Strike Distance: ", data.closestPulseDistance)  # float

if __name__ == "__main__":
    # Ensure the user provided both latitude and longitude
    if len(sys.argv) != 3:
        print("Usage: py ./spark.py <LAT> <LONG>")
        sys.exit(1)

    # Parse command-line arguments
    lat = float(sys.argv[1])
    lon = float(sys.argv[2])

    # Run the main async function
    asyncio.run(main(lat, lon))
