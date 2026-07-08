from PIL import Image

img = Image.open(r"d:\project-ticketing-bus\static\img\founder_line_art.png")
img = img.convert("RGBA")
datas = img.getdata()

newData = []
width, height = img.size

margin_x = int(width * 0.08)
margin_y = int(height * 0.08)

for y in range(height):
    for x in range(width):
        idx = y * width + x
        item = datas[idx]
        
        if x < margin_x or x > width - margin_x or y < margin_y or y > height - margin_y:
            newData.append((0, 0, 0, 0))
            continue
            
        if item[0] < 80 and item[1] < 80 and item[2] < 80:
            newData.append((0, 0, 0, 0))
        else:
            # It's a gold line pixel
            # Add some feathering based on brightness
            brightness = max(item[0], item[1], item[2])
            alpha = int((max(0, brightness - 50) / 205.0) * 255)
            alpha = min(255, alpha)
            newData.append((item[0], item[1], item[2], alpha))

img.putdata(newData)
img.save(r"d:\project-ticketing-bus\static\img\founder_line_art_transparent.png", "PNG")
print('Done!')
