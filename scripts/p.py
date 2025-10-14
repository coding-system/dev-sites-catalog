import requests
import execjs

# Читаем файл links.js
with open("links.js", "r", encoding="utf-8") as file:
    js_content = file.read()

# Убираем `export const`, чтобы код стал валидным JS-объектом
js_content = js_content.replace("export const ", "")

# Выполняем JS-код и получаем переменные
ctx = execjs.compile(js_content)
blocked_links = ctx.eval("blockedLinks")
all_links = ctx.eval("allLinks")

# Функция проверки X-Frame-Options
def is_blocked_in_iframe(url):
    try:
        response = requests.head(url, timeout=5)
        x_frame_options = response.headers.get("X-Frame-Options", "").lower()
        return x_frame_options in ["deny", "sameorigin"]
    except requests.RequestException:
        return False

# Перемещаем запрещенные ссылки
new_blocked_links = [link for link in all_links if is_blocked_in_iframe(link["url"])]
blocked_links.extend(new_blocked_links)
all_links = [link for link in all_links if link not in new_blocked_links]

# Генерируем новый `links.js`
updated_js = f"""export const blockedLinks = {blocked_links};

export const allLinks = {all_links};
"""

# Записываем обратно
with open("links.js", "w", encoding="utf-8") as file:
    file.write(updated_js)

print("Файл links.js обновлен!")
