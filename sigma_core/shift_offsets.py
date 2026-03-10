import re

with open('src/memory.rs', 'r') as f:
    content = f.read()

# Define a function to subtract 7999992 from integers safely
def shift_match(m):
    val_str = m.group(1).replace('_', '')
    val = int(val_str)
    
    # Only shift values >= 7999992
    if val >= 7999992:
        new_val = val - 7999992
        # Format with underscores
        new_str = f"{new_val:,}".replace(',', '_')
        return f"{new_str},"
    return m.group(0)

# Replace the struct field
content = content.replace("pub _pad_safety: [u8; SAFETY_BUFFER - 8], // 0 to 7,999,992\n    ", "")

# We need to replace numbers in the assert_eq!(offset_of!..., NUMBER, "...") pattern
# The pattern is: offset_of!(SigmaMatrix, field_name),\n            NUMBER,
# or offset_of!(SigmaMatrix, field_name), NUMBER,

out1 = re.sub(r'(\d[\d_]+),', shift_match, content)

with open('src/memory.rs', 'w') as f:
    f.write(out1)
