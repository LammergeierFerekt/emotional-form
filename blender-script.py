import bpy
import csv
import math
import random
import re
import mathutils  # Import mathutils for vector calculations

# Global dictionary to store sphere data
spheres = {}

# Function to import CSV data
def import_csv(filepath):
    with open(filepath, 'r', encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file, delimiter=',')
        rows = []
        for row in reader:
            # Normalize keys: strip whitespace, quotes, BOM remnants
            normalized = {}
            for k, v in row.items():
                if k is None:
                    continue
                nk = k.strip().replace('"', '').replace('\ufeff', '')
                normalized[nk] = v
            rows.append(normalized)
        return rows

# Function to create a material from RGB color
def create_material(name, r, g, b):
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (r, g, b, 1)  # Add alpha channel
    return material

# Function to parse position from string
def parse_position(position_str):
    position_str = position_str.replace('"', '').strip()
    try:
        return tuple(map(float, position_str.split(',')))
    except ValueError:
        return (0.0, 0.0, 0.0)

# Function to get a random position ensuring no overlap with other spheres and connection lines
def get_random_position(radius, existing_positions, min_distance=2.0):
    while True:
        position = (random.uniform(-50, 50), random.uniform(-50, 50), random.uniform(-50, 50))
        if all(math.dist(position, pos) > (radius + r + min_distance) for pos, r in existing_positions):
            return position

# Function to create spheres
def create_spheres(data):
    existing_positions = []
    for row in data:
        sphere_name = row['sphere_name']
        radius = float(row.get('radius', 1.0))  # Default radius is 1.0
        color_str = row.get('sphere_color', "RGB(255,255,255)").replace("RGB(", "").replace(")", "")
        color = [float(c) / 255.0 for c in color_str.split(',')]
        position_str = row.get('position', "0,0,0")
        position = parse_position(position_str)

        # Ensure spheres are not overlapping
        if position == (0, 0, 0):
            position = get_random_position(radius, existing_positions)

        # Create sphere
        bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=position)
        sphere = bpy.context.active_object
        sphere.name = sphere_name
        sphere.data.materials.append(create_material(f"{sphere_name}_Mat", *color))

        # Store sphere data
        spheres[sphere_name] = {
            'object': sphere,
            'position': position,
            'radius': radius,
            'connections': []
        }
        existing_positions.append((position, radius))

# Function to create a connection between two spheres using a cylinder with thickness of 0.5
def create_connection(sphere1, sphere2, connection_type, name):
    # Calculate the midpoint and direction vector
    start = mathutils.Vector(sphere1.location)
    end = mathutils.Vector(sphere2.location)
    direction = end - start
    distance = direction.length
    
    # Adjust start and end points to avoid overlapping spheres
    direction.normalize()
    start += direction * sphere1.dimensions[0] / 2
    end -= direction * sphere2.dimensions[0] / 2
    
    midpoint = (start + end) / 2
    
    # Create cylinder to represent the connection line with thickness of 0.5
    bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=distance, location=midpoint)
    cylinder = bpy.context.active_object
    
    # Align the cylinder with the connection direction
    cylinder.rotation_mode = 'QUATERNION'
    cylinder.rotation_quaternion = direction.to_track_quat('Z', 'Y')
    
    # Set material based on connection type
    if connection_type == ">":
        color = (0.0, 1.0, 0.0)  # Green for ">"
    elif connection_type == "<":
        color = (1.0, 0.0, 0.0)  # Red for "<"
    else:
        color = (0.6, 0.6, 0.6)  # Gray for "=" or other
    cylinder.data.materials.append(create_material(f"Line_{connection_type}_Mat", *color))

    # Assign a meaningful name to the cylinder
    cylinder.name = f"{connection_type}_{name[0]}_{name[1]}"

# Function to create connections between spheres based on the CSV
def create_connections(data):
    for row in data:
        sphere_name = row['sphere_name']
        connections = []

        # Extract the connections from all columns
        for key, value in row.items():
            if "connection" in key.lower() and value.strip():
                # Clean up and split connections by semicolon
                connections.extend([conn.strip() for conn in value.split(";") if conn.strip()])

        # Create the connections for this sphere
        for connection in connections:
            # Identify connection type and clean up the connection name
            connection_type = "neutral"
            if connection.startswith("<"):
                connection_type = "<"
                connection = connection[1:].strip()
            elif connection.startswith(">"):
                connection_type = ">"
                connection = connection[1:].strip()
            else:
                # no symbol = neutral (gray)
                connection_type = "neutral"


            # Now check if the sphere exists and create a connection
            if connection in spheres:
                target_sphere = spheres[connection]['object']
                create_connection(spheres[sphere_name]['object'], target_sphere, connection_type, (sphere_name, connection))
            else:
                print(f"Warning: Sphere '{connection}' not found for connection of '{sphere_name}'.")

# Main Execution
csv_filepath = "C:\\Users\\livad\\Fisiere_coding\\emotional-form\\blender_spheres.csv"

# Import CSV data, create spheres and connections
csv_data = import_csv(csv_filepath)
create_spheres(csv_data)
create_connections(csv_data)
