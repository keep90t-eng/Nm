import os
import zipfile

def zipdir(path, ziph, root_prefix):
    for root, dirs, files in os.walk(path):
        for file in files:
            # Skip node_modules and hidden files if any
            if 'node_modules' in root or '.git' in root:
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, path)
            ziph.write(full_path, os.path.join(root_prefix, rel_path))

os.makedirs('public/downloads', exist_ok=True)

with zipfile.ZipFile('public/downloads/mazarie-store-app.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('exports/store-app', zipf, 'store-app')

with zipfile.ZipFile('public/downloads/mazarie-admin-app.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('exports/admin-app', zipf, 'admin-app')

print("Created public/downloads/mazarie-store-app.zip and mazarie-admin-app.zip successfully!")
