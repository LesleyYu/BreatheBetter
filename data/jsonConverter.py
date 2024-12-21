import pandas as pd
import json

# Read the CSV file
df = pd.read_csv('air_quality_locations.csv')

# Filter out rows without lat and lng
df_filtered = df.dropna(subset=['lat', 'lng'])

# Fill NaN values with 0.0
df_filtered = df_filtered.fillna(0.0)

# Extract city names without state codes
df_filtered['city'] = df_filtered['City or Locality'].str.extract(r'([^(]+)')[0].str.strip()

# Group by city
city_groups = df_filtered.groupby('city')

# Create the JSON structure
json_data = []
for city, group in city_groups:
    city_data = {
        "city": city,
        "data": []
    }
    
    # Sort by year and create data entries
    sorted_group = group.sort_values('Measurement Year')
    for _, row in sorted_group.iterrows():
        year_data = {
            "year": int(row['Measurement Year']),
            "PM2.5": float(row['PM2.5 (μg/m3)']),
            "PM10": float(row['PM10 (μg/m3)']),
            "NO2": float(row['NO2 (μg/m3)'])
        }
        city_data["data"].append(year_data)
    
    json_data.append(city_data)

# Write to JSON file
with open('air_quality_data.json', 'w') as f:
    json.dump(json_data, f, indent=4)