import sys
import json

def parse(List): 
    flat_list = [[item[1], item[0]] for item in List]
    return flat_list

if len(sys.argv) < 2:
    print('Usage: python convert_missing.py [GeoJSON File]')
else:
    dct = {}
    with open(sys.argv[1]) as f:
        for line in f:
            json_data = json.loads(line)
            name = json_data['properties']['Name']
            points = parse(json_data['geometry']['coordinates'])
            dct[name] = ['Built in XXXX', points]

    print(str(dct).replace('\'', '"'))
