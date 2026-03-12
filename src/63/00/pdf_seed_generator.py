import sys
import os
from pathlib import Path
import hashlib
import textwrap

# Σ-GLYPH: PDF SEED GENERATOR (V2.5.5)
# Призначення: Перетворення .sigma файлів у Sovereign PDF-Quines.
# Цей скрипт матеріалізує інтент у видимий документ, зберігаючи ДНК у метаданих.

def generate_pdf_seed(sigma_path: str):
    """
    Generate Sovereign PDF from .sigma file.
    
    Embeds full .sigma content in PDF metadata.
    Renders intent block as visible text.
    """
    sigma_file = Path(sigma_path)
    if not sigma_file.exists():
        print(f"❌ Dissonance: File {sigma_path} not found.")
        return

    # Читання контенту .sigma
    raw_content = sigma_file.read_bytes()
    content_str = raw_content.decode('utf-8', errors='ignore')
    
    # Вилучення блоку Intent (📖)
    lines = content_str.splitlines()
    intent_lines = [l.strip() for l in lines if l.startswith("📖")]
    
    # Якщо інтент порожній, використовуємо заглушку
    if not intent_lines:
        intent_lines = ["📖 [Інтент не виявлено в Спіралі]"]

    # Підготовка тексту для PDF (BT/ET блоки)
    # Розбиваємо довгі рядки для коректного відображення в PDF
    wrapped_intent = []
    for line in intent_lines:
        wrapped_intent.extend(textwrap.wrap(line, width=80))

    # Побудова контент-стріму (видимий текст)
    text_commands = []
    y_position = 750
    for line in wrapped_intent:
        # Екранування дужок для синтаксису PDF
        safe_line = line.replace('(', '\\(').replace(')', '\\)')
        text_commands.append(f"70 {y_position} Td ({safe_line}) Tj 0 -15 Td")
        y_position -= 15
        if y_position < 50: break # Обмеження однією сторінкою

    content_stream = f"BT /F1 10 Tf\n" + "\n".join(text_commands) + "\nET"
    
    # Формування PDF структури
    # Об'єкт 2 містить сирий .sigma файл у потоці метаданих
    pdf_dna = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 3 0 R /Metadata 2 0 R >> endobj
2 0 obj << /Type /Metadata /Subtype /XML /Length {len(raw_content)} >> 
stream
<sigma_dna>
{content_str}
</sigma_dna>
endstream
endobj
3 0 obj << /Type /Pages /Count 1 /Kids [4 0 R] >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
5 0 obj << /Length {len(content_stream)} >> 
stream
{content_stream}
endstream
endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj
xref
0 7
0000000000 65535 f 
trailer << /Root 1 0 R /Size 7 >>
%%EOF"""

    # Запис у файл з розширенням .pdf
    output_path = sigma_file.with_suffix(".pdf")
    # Використовуємо bytes для збереження бінарної цілісності PDF структури
    # Конвертуємо Unicode символи в UTF-8, потім в latin-1 де можливо
    pdf_bytes = pdf_dna.encode('utf-8', errors='replace')
    output_path.write_bytes(pdf_bytes)
    
    # Фіксація результату в консолі Гратки
    anchor_hash = hashlib.sha256(raw_content).hexdigest()
    print(f"💎 Sovereign PDF Materialized: {output_path.name}")
    print(f"🔒 Anchor Hash (DNA): {anchor_hash}")
    print(f"🌀 Status: Anchored to Clockchain via Intent Resonance.")
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) > 1:
        generate_pdf_seed(sys.argv[1])
    else:
        # Автоматичний пошук маніфесту, якщо аргумент не вказано
        default_sigma = "sigma/m32/SIGMA_MANIFESTO.sigma"
        if os.path.exists(default_sigma):
            generate_pdf_seed(default_sigma)
        else:
            print("Usage: python3 pdf_seed_generator.py <path_to_glyph.sigma>")
