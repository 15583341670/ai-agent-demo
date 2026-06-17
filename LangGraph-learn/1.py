import os
import json

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool


load_dotenv()


@tool
def add(a: float, b: float) -> float:
    """计算两个数字相加的结果。"""
    print(f"正在调用 add 工具，参数：a={a}, b={b}")
    return a + b


model = ChatOpenAI(
    model="qwen3.7-plus",
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    temperature=0,
)


agent = create_agent(
    model=model,
    tools=[add],
    system_prompt="你是一个计算助手，涉及数学计算时必须调用工具。"
)


result = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "22加上1等于多少？"
        }
    ]
})


print("最终回答：")
print(result["messages"][-1].content)