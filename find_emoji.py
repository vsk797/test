import os

search_char = "\U0001f4a1"  # 💡
search_path = "ux"

print(f"Searching for character {search_char} in {search_path}...")

for root, dirs, files in os.walk(search_path):
    for file in files:
        filepath = os.path.join(root, file)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                if search_char in content:
                    print(f"Found in: {filepath}")
        except UnicodeDecodeError:
            print(f"Could not read (encoding error): {filepath}")
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
