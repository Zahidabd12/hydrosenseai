import os

def split_index_html():
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract CSS
    css_start = content.find("<style>") + len("<style>")
    css_end = content.find("</style>")
    css_content = content[css_start:css_end].strip()
    
    # Extract JS
    js_start = content.rfind("<script>") + len("<script>")
    js_end = content.rfind("</script>")
    js_content = content[js_start:js_end].strip()
    
    # Build new HTML
    head_end = content.find("</head>")
    head_start = content.find("<head>") + len("<head>")
    
    # Replace style and script in head/body
    html_new = content[:css_start - len("<style>")] + \
               '  <link rel="stylesheet" href="/static/css/style.css">\n' + \
               content[css_end + len("</style>"):js_start - len("<script>")] + \
               '  <script src="/static/js/app.js"></script>\n' + \
               content[js_end + len("</script>"):]
    
    with open("app/ui/static/css/style.css", "w", encoding="utf-8") as f:
        f.write(css_content)
        
    with open("app/ui/static/js/app.js", "w", encoding="utf-8") as f:
        f.write(js_content)
        
    with open("app/ui/templates/index.html", "w", encoding="utf-8") as f:
        f.write(html_new)
        
    print("Extraction successful.")

if __name__ == "__main__":
    split_index_html()
