import pandas as pd

# Read the CSV files
aap_df = pd.read_csv('aap.csv')
cities_df = pd.read_csv('uscities.csv')

# Clean up city names to match
aap_df['City'] = aap_df['City or Locality'].str.extract(r'([^(]+)')[0].str.strip()
cities_df['City'] = cities_df['city']

# Merge the dataframes
merged_df = pd.merge(
    aap_df,
    cities_df[['City', 'lat', 'lng']],
    on='City',
    how='left'
)

# Select and rename columns
final_df = merged_df[[
    'City or Locality', 
    'Measurement Year', 
    'PM2.5 (μg/m3)', 
    'PM10 (μg/m3)', 
    'NO2 (μg/m3)',
    'lat',
    'lng'
]]

# Save to CSV
final_df.to_csv('air_quality_locations.csv', index=False)