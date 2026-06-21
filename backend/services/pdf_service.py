from fastapi import HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
import fitz
import io
import pdfplumber

# Extract Content

def extract_content_from_pdf(filebytes:bytes) -> list[dict]:
    block = []

    #PyMuPdf for text
    doc = fitz.open(stream=filebytes, filetype="pdf")
    pages = {}
    text_pages = 0
    for page_num, page in enumerate(doc):
        text = page.get_text().strip()
        pages[page_num] = text
        if text:
            text_pages += 1
    doc.close()
    if text_pages < 1:
        raise HTTPException(
            status_code=400,
            detail="This PDF appears to be scanned or contains no extractable text."
        )

    # pdfPlumber for tables
    with pdfplumber.open(io.BytesIO(filebytes)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
        
            if tables:
                for table in tables:
                    readable = table_to_text(table)
                    block.append({
                        "type" : "table",
                        "page" : page_num + 1,
                        "content" : readable
                    })

        # Add the whole page's text for this table
            page_text = pages.get(page_num, '').strip()
            if page_text:
                block.append({
                    "type" : "text",
                    "page" : page_num + 1,
                    "content" : page_text
            })
    return block

# Converting table into readable text for embedding

def table_to_text(table: list) -> str:
    """
    Input:  [["Benefit", "Sub-limit"], ["Room Rent", "₹3000/day"]]
    Output: "Benefit: Room Rent | Sub-limit: ₹3000/day"
    """
    if not table or not table[0]:
        return ""
    
    headers = [str(h).strip() if h else "" for h in table[0]]
    rows = []
    last_row_label = ""

    for row in table[1:]:
        if not any(cell for cell in row if cell):
            continue

        cells = []
        for i, cell in enumerate(row):
            if cell is None:
                if i == 0:
                    cell_val = last_row_label
                else: 
                    continue
            else:
                cell_val = str(cell).strip().replace("\n", " ")

            if i == 0:
                last_row_label = cell_val

            header = headers[i] if i<len(headers) else f'col{i}'
            if cell_val:
                cells.append(f'{header}:{cell_val}')
        if cells:
            rows.append(" | ".join(cells))

    return "\n".join(rows)
    
# Splitter

def get_chunks(block : list[dict]) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 800,
        chunk_overlap = 200,
        separators=[
        "\n\nSection",     # Major sections
        "\n\nClause",      # Clauses
        "\n\nEXCLUSION",   # Exclusions block
        "\n\nDEFINITION",  # Definitions
        "\n\n",            # Paragraph breaks
        "\n",              # Line breaks
        ". ",              # Sentence breaks
        " ",               # Word breaks
        ""
        ]
    )

    chunks = []

    for sub_Block in block:
        # Table stays whole, does not get chunked
        if sub_Block["type"] == "table":
            table_chunk = f'[TABLE: Page{sub_Block["page"]}\n Content: {sub_Block["content"]}]'
            chunks.append(table_chunk)
        else:
            text_chunk = splitter.split_text(sub_Block["content"])
            chunks.extend(text_chunk)
    print(f"Total chunks generated: {len(chunks)}")
    return chunks


