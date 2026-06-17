import os
# 定义工具和模型
from langchain.tools import tool
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage,SystemMessage
import json
# 类型
from typing_extensions import TypedDict, Annotated
from typing import Any
import operator


# 定义工具
@tool
def add(a: int, b: int) -> int:
    """将`a`和`b`相加。

        参数：
            a: 第一个整数
            b: 第二个整数
        """
    return a + b

# 环境变量引入
load_dotenv()

# 增强LLM的工具能力
tools = [add]


# 定义模型状态
class MessagesState(TypedDict):
      messages: Annotated[list[Any], operator.add]
      llm_calls: int

# 定义模型节点函数
def lim_call(state:dict)->MessagesState:
    """
       模型节点：
       1. 接收 LangGraph 当前的 State
       2. 将系统提示词和历史消息一起传给模型
       3. 模型判断是直接回答，还是发起工具调用
       4. 返回新增的 AIMessage 和最新的模型调用次数
       5. 返回值会由 LangGraph 自动合并回 State
    """
    # 给模型准备本次调用的完整消息上下文：
    # 系统提示词 + State 中已经保存的历史消息
    messages = [
                   SystemMessage(
                       content="你是一个智能审查助手"
                   )
               ] + state["messages"]
    # 调用已经绑定工具的模型
    # 返回值是一个 AIMessage
    #
    # AIMessage 可能有两种情况：
    # 1. 直接回答：response.content 中有文本
    # 2. 请求调用工具：response.tool_calls 中有工具名和参数
    response = model_with_tools.invoke(messages)
    # 节点只返回需要更新的 State 字段，
    # 不需要返回完整 State。
    #
    # LangGraph 会自动接收这个字典，
    # 再根据 State 中定义的合并规则更新全局状态。
    return {
            # response 是一条 AIMessage，
            # 因为 State 中 messages 是列表，所以这里要套一层列表。
            #
            # 如果 messages 配置了 reducer，
            # 这条新消息会追加到原来的消息列表中。
            "messages": [response],

            # 获取当前模型调用次数：
            # 如果 llm_calls 不存在，默认从 0 开始，然后加 1。
            #
            # 因为 llm_calls 没有追加规则，
            # 所以这个新值会直接覆盖 State 中的旧值。
            "llm_calls": state.get("llm_calls", 0) + 1,
        }


# 定义工具节点函数


if __name__ == "__main__":
    print("看看能拿到环境环比昂",os.getenv("OPENAI_API_KEY"))
    print("看看能拿到环境环比昂",os.getenv("OPENAI_BASE_URL"))
    # 初始化智能体
    model = init_chat_model(
        model="openai:qwen3.5-plus",
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL"),
        temperature=0,
    )
    
    # 工具绑定需要用到这个api
    # 使用 bind_tools 绑定工具
    model_with_tools = model.bind_tools(tools)

    # 提出问题
    user_message = HumanMessage(
        content="调用工具说22加上1等于多少"
    )
    # 拿到模型的回答(因为是模型调用工具所以这里只返回模型需要调用的工具)
    res = model_with_tools.invoke([
        user_message
    ])
    res.pretty_print()
    print('回答的结果',res)
    # print("工具调用：", res.tool_calls)

