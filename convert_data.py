import xmltodict
import json

from pprint import pprint

with open('data/buildings.xml', 'r') as content_file:
    content = content_file.read()

data = xmltodict.parse(content)

def polygon_to_list(polygon):
    lst = []
    if type(polygon['outerBoundaryIs']) == list:
        for i in polygon['outerBoundaryIs']:
            new_lst = []
            for item in i['LinearRing']['coordinates'].split('\n'):
                # print(1)
                coordinates = item.split(',')
                lat, lng = float(coordinates[1]), float(coordinates[0])
                new_lst.append([lat, lng])
            lst.append([new_lst])
    else:
        if len(polygon['outerBoundaryIs']['LinearRing']['coordinates'].split('\n')) == 1:
            items = polygon['outerBoundaryIs']['LinearRing']['coordinates'].split(',0.0 ')
        else:
            items = polygon['outerBoundaryIs']['LinearRing']['coordinates'].split('\n')

        for item in items:
            # print(2)
            coordinates = item.split(',')
            lat, lng = float(coordinates[1]), float(coordinates[0])
            lst.append([lat, lng])

        if 'innerBoundaryIs' in polygon['outerBoundaryIs'].keys():
            new_lst = []
            for item in polygon['innerBoundaryIs']['LinearRing']['coordinates'].split('\n'):
                # print(3)
                coordinates = item.split(',')
                lat, lng = float(coordinates[1]), float(coordinates[0])
                new_lst.append([lat, lng])
            lst = [lst, new_lst]

    return lst


processed_buildings = {}

for building_data in data['kml']['Document']['Placemark']:
    if 'Polygon' in building_data.keys():
        polygons = building_data['Polygon']
        name = building_data['name']
        built = building_data['built']
        # print(name)

        if type(polygons) == list:
            # process multiple
            processed_building = []
            for shape in polygons:
                processed_building.append([polygon_to_list(shape)])
        else:
            processed_building = polygon_to_list(polygons)

        processed_buildings[name] = [built, processed_building]

# pprint(processed_buildings)
with open('src/data/processed_buildings.json', 'w') as fp:
    json.dump(processed_buildings, fp)



