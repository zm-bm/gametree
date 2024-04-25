import os
import argparse
import json
import re


def strip_move_number(chess_move):
    pattern = r'^\d+\.\s*'
    stripped_move = re.sub(pattern, '', chess_move)
    return stripped_move

def parse_eco_line(line):
    match = re.match(r"(\w+)\s+\"([^\"]+)\"\s+(.*)\s(\*|\d-\d|\d\/\d-\d\/\d)", line)
    if match:
        return {
            "code": match.group(1),
            "name": match.group(2),
            "moves": match.group(3).strip().split(' '),
            "result": match.group(4)
        }
    else:
        return None

def insert_moves(tree, moves, eco_code, name):
    current = tree
    for rawmove in moves:
        move = strip_move_number(rawmove)
        if move not in current:
            current[move] = {}
        current = current[move]
    current['code'] = eco_code
    current['name'] = name

def eco_to_json(eco_file_path, output_json_path):
    tree = {}
    with open(eco_file_path, 'r') as file:
        entry = ''
        for line in file:
            line = line.rstrip('\n')
            entry += line
            if line.endswith('*'):
                parsed_eco = parse_eco_line(entry)
                if parsed_eco:
                    insert_moves(tree, parsed_eco['moves'], parsed_eco['code'], parsed_eco['name'])
                entry = ''
                
    with open(output_json_path, 'w') as json_file:
        json.dump(tree, json_file, indent=2)

def main():
    parser = argparse.ArgumentParser(description="Build opening book from eco file")
    parser.add_argument('filename', type=str, help='eco filename')
    args = parser.parse_args()
    
    if os.path.exists(args.filename):
      output_json_path = 'book.json'
      eco_to_json(args.filename, output_json_path)
    else:
        print(f"File '{args.filename}' does not exist.")   

if __name__ == "__main__":
    main()
