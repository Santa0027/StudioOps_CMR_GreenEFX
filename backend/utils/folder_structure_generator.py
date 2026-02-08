import os
import json # might be needed later if we handle saving/loading structures in this module, but not for initial extraction

def parse_structure_to_tree(lines):
    """
    Parses a list of indented lines representing a folder structure into a tree-like list of dictionaries.
    Each dictionary has a 'name' and 'children' key.
    """
    tree, stack = [], []
    for line in lines:
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        node = {"name": line.strip(), "children": []}
        while stack and stack[-1][0] >= indent:
            stack.pop()
        if stack:
            stack[-1][1]["children"].append(node)
        else:
            tree.append(node)
        stack.append((indent, node))
    return tree

def tree_to_lines(tree, indent=0):
    """
    Converts a tree-like list of dictionaries (representing a folder structure) back into
    a list of indented lines.
    """
    lines = []
    for node in tree:
        lines.append(" " * indent + node["name"])
        if node["children"]:
            lines.extend(tree_to_lines(node["children"], indent + 4))
    return lines

def create_folders(base_path, tree):
    """
    Creates a folder structure based on a tree-like list of dictionaries at a given base path.
    Returns True on success, False on failure.
    """
    if not os.path.exists(base_path):
        try:
            os.makedirs(base_path)
        except OSError as e:
            print(f"Error: Cannot create base directory '{base_path}': {e}")
            return False

    def _create_recursive(nodes, current_path):
        for node in nodes:
            folder_name = node["name"].strip()
            if folder_name == "":
                continue
            folder_path = os.path.join(current_path, folder_name)
            try:
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)
            except OSError as e:
                print(f"Error: Cannot create folder '{folder_path}': {e}")
                return False
            if node["children"]:
                if not _create_recursive(node["children"], folder_path):
                    return False
        return True

    return _create_recursive(tree, base_path)