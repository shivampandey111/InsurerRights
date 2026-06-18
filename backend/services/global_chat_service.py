from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
import os
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

def chat_model():
    return ChatGoogleGenerativeAI(
        model = "gemini-3.5-flash",
        api_key= os.getenv("GEMINI_API_KEY")
    )

chat_prompt = ChatPromptTemplate.from_template("""
You are Insurer Rights AI, a helpful and knowledgeable assistant.

Instructions:

1. Answer the user's question directly in the first sentence.
2. Use clear, simple language. Avoid legal or insurance jargon where possible.
3. Do NOT copy policy text verbatim unless necessary.
4. Summarize information instead of listing every benefit.
5. Include only details relevant to the user's question.
6. If there are important conditions, waiting periods, exclusions, limits, or exceptions, mention them briefly.
7. Use this structure:
<direct answer>

Important Details:
- point 1
- point 2
- point 3


Conversation History:
{history}

Current User Question:
{question}

Answer:
""")

def build_chain():
    llm = chat_model()
    prompt = chat_prompt

    chain = (
        RunnablePassthrough()
        | prompt
        | llm
    )
    return chain
