import os

# Configuration
SOURCE_DIR = "ux"
OUTPUT_FILE = "ux_md.md"
# Extensions to include
INCLUDE_EXTS = {".ts", ".tsx", ".css", ".html", ".json", ".js", ".md", ".toml"}
# Directories to exclude
EXCLUDE_DIRS = {"node_modules", ".git", "dist", "build", ".vscode", "coverage"}
# Files to exclude
EXCLUDE_FILES = {"package-lock.json", "bun.lockb", "yarn.lock"}


def generate_markdown(source_dir, output_file):
    print(f"Generating {output_file} from {source_dir}...")

    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.write(f"# Project Summary: {source_dir}\n\n")

        for root, dirs, files in os.walk(source_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES:
                    continue

                _, ext = os.path.splitext(file)
                if ext.lower() not in INCLUDE_EXTS:
                    continue

                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, source_dir)

                try:
                    with open(filepath, "r", encoding="utf-8") as infile:
                        content = infile.read()

                    outfile.write(f"## {rel_path}\n\n")
                    outfile.write(f"```{ext[1:] if ext.startswith('.') else ext}\n")
                    outfile.write(content)
                    outfile.write("\n```\n\n")
                    print(f"Processed: {rel_path}")

                except Exception as e:
                    print(f"Skipping {rel_path}: {str(e)}")

    print(f"Done! Output saved to {output_file}")


if __name__ == "__main__":
    generate_markdown(SOURCE_DIR, OUTPUT_FILE)
