import requests
import json
import os

# External source endpoints (Audited from nammakasa.in)
SUPABASE_URL = "https://tcldazhypyuutdpoksfx.supabase.co/rest/v1/"
# Anonymous key extracted from JS bundle
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbGRhemh5cHl1dXRkcG9rc2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTE5MzcsImV4cCI6MjA5MDg2NzkzN30.E6HWvErPgkTomXCuxunwwCBbDXsOZ4dVCQ2Bo7_BgAs"

def fetch_external_data():
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}"
    }

    print("Fetching Wards...")
    wards_res = requests.get(SUPABASE_URL + "wards?select=*", headers=headers)
    wards = wards_res.json() if wards_res.status_code == 200 else []

    print("Fetching Representatives...")
    reps_res = requests.get(SUPABASE_URL + "representatives?select=*", headers=headers)
    reps = reps_res.json() if reps_res.status_code == 200 else []

    return wards, reps

def map_and_save(wards, reps):
    rep_map = {}
    for rep in reps:
        key = rep['constituency'].lower()
        if key not in rep_map:
            rep_map[key] = {'mla': '', 'mp': '', 'mla_party': ''}
        
        if rep['role'] == 'mla':
            rep_map[key]['mla'] = rep['name']
            rep_map[key]['mla_party'] = rep['party']
        elif rep['role'] == 'mp':
            rep_map[key]['mp'] = rep['name']

    mapped = []
    for w in wards:
        constituency_key = (w.get('assembly_constituency') or '').lower()
        parliament_key = (w.get('parliamentary_constituency') or '').lower()
        
        mla_info = rep_map.get(constituency_key, {})
        mp_info = rep_map.get(parliament_key, {})

        mapped.append({
            'ward_number': w['ward_number'],
            'ward_name': w['ward_name'],
            'zone': w['zone'],
            'assembly': w['assembly_constituency'],
            'parliament': w['parliamentary_constituency'],
            'mla_name': mla_info.get('mla', 'TBD'),
            'mla_party': mla_info.get('mla_party', ''),
            'mp_name': mp_info.get('mp', 'TBD'),
            'center': [w['center_lng'], w['center_lat']],
            'boundary_wkb': w['boundary'],
            'city': 'Bengaluru'
        })

    output_path = 'server/src/utils/bengaluru_wards_full.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(mapped, f, indent=2)
    
    print(f"Update Complete. Saved {len(mapped)} wards to {output_path}")

if __name__ == "__main__":
    w, r = fetch_external_data()
    if w and r:
        map_and_save(w, r)
    else:
        print("Failed to fetch source data.")
