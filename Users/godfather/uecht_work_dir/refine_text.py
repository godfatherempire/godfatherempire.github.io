import os
import re

def refine_website(root_dir):
    # mapping[attr] = {old_val: new_val}
    mapping = {
        'data-en': {
            'Extreme Creators of<br><span class="accent">the Universe</span': 'Pioneering the Convergence of<br><span class="accent">Energy and Intelligence</span>',
            'About': 'Founding Principles & Mission',
            'News': 'Insights & Chronicles',
            'Careers': 'Join the Vanguard',
            'Charity & Aid': 'Humanitarian Initiatives',
            'Energy · AI': 'Synergy of Energy and Intelligence',
            'Biotech & Bio-Spiritual Science': 'Bio-Convergence & Neural Evolution'
        },
        'data-cn': {
            '極創寰宇，<br><span class="accent">創造未來</span>': '極創寰宇，<br><span class="accent">智慧革命</span>',
            '關於我們': '使命與宗旨',
            '新聞': '洞察與紀實',
            '招聘資訊': '精英招募',
            '慈善援助': '人道主義倡議',
            '能源・AI': '能源與智能的協同',
            '生物・精神科學': '生物融合與神經進化'
        }
    }

    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                changed = False
                new_content = content
                for attr, rules in mapping.items():
                    for old_val, new_val in rules.items():
                        # Use regex to find and replace the specific attribute value safely
                        # Pattern: attr="old_val" -> attr="new_val"
                        pattern = re.escape(attr) + r'="[^"]*' + re.escape(old_val) + r'[^"]*'
                        if f'{attr}="{old_val}"' in new_content or f'{attr}="{old_val}' in new_content: # simple check
                            pass 
                        
                        # More robust approach: Find all occurrences of the attribute and replace if value matches
                        # Since we know the exact string, we can just do a direct replacement on the text fragment
                        target = f'{attr}="{old_val}"'
                        if target in new_content:
                            new_content = new        = new_content.replace(target, f'{attr}="{new_val}"')
                            changed = True

                # Correcting logic to be extremely safe with regex/string replacement
                # Let's use a simpler approach for the script to ensure it works without bs4
                pass

def refine_website_simple(root_dir):
    mapping = {
        'data-en="Extreme Creators of<br><span class="accent">the Universe</span"': 'data-en="Pioneering the Convergence of<br><span class="accent">Energy and Intelligence</span"',
        'data-cn="極創寰宇，<br><span class="accent">創造未來</span"': 'data-cn="極創寰宇，<br><span class="accent">智慧革命</span"',
        'data-en="About"': 'data-en="Founding Principles & Mission"',
        'data-cn="關於我們"': 'data-cn="使命與宗旨"',
        'data-en="News"': 'data-en="Insights & Chronicles"',
        'data-cn="新聞"': 'data-cn="洞察與紀實"',
        'data-en="Careers"': 'data-en="Join the Vanguard"',
        'data-cn="招聘資訊"': 'data-cn="精英招募"',
        'data-en="Charity & Aid"': 'data-en="Humanitarian Initiatives"',
        'data-cn="慈善援助"': 'data-cn="人道主義倡議"',
        'data-en="Energy · AI"': 'data-en="Synergy of Energy and Intelligence"',
        'data-cn="能源・AI"': 'data-cn="能源與智能的協同"',
        'data-en="Biotech & Bio-Spiritual Science"': 'data-en="Bio-Convergence & Neural Evolution"',
        'data-cn="生物・精神科學"': 'data-cn="生物融合與神經進化"'
    }

    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(subdir, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                changed = False
                for old_str, new_str in mapping.items():
                    if old_str in new_content:
                        new_content = new_content.replace(old_str, new_str)
                        changed = True
                
                if changed:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    refine_website_simple("/Users/godfather/uecht_work_dir")
