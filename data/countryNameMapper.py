import json

# Read the pollution data
with open('pollution_HAP.json', 'r') as f:
    pollution_data = json.load(f)

# Read the country codes data
with open('country-codes-lat-lng.json', 'r') as f:
    country_codes_data = json.load(f)

# Create a mapping of location names from pollution data
pollution_locations = set(item['location_name'] for item in pollution_data)

# Create a new country codes list with matched names
new_country_codes = []
matched_locations = set()

for country_entry in country_codes_data['ref_country_codes']:
    country_name = country_entry['country']
    matched = False
    
    # Check each pollution location
    for location in pollution_locations:
        # Check if country name is contained within location name
        if country_name.lower() in location.lower():
            # Create a new entry with the location name
            new_entry = country_entry.copy()
            new_entry['country'] = location
            new_country_codes.append(new_entry)
            matched_locations.add(location)
            matched = True
            break
    
    # If no match found, keep the original entry
    if not matched:
        new_country_codes.append(country_entry)

# Create the new output structure
output_data = {
    'ref_country_codes': new_country_codes
}

# Write the new file
with open('country-codes-lat-lng1.json', 'w') as f:
    json.dump(output_data, f, indent=2)

# Print statistics
print(f"Total original country codes: {len(country_codes_data['ref_country_codes'])}")
print(f"Total pollution locations: {len(pollution_locations)}")
print(f"Total matched locations: {len(matched_locations)}")