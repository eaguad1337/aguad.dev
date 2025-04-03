---
title: "Langchain, Ollama and MySQL"
date: 2025-04-02
draft: false
description: "Using LangChain to query a database with natural language"
tags: ["python", "mysql", "langchain", "ollama"]
showTableOfContents: true
slug: "langchain"
---

# Introduction to LangChain for Database Queries

LangChain is a powerful framework designed to help developers build applications with language models. In this beginner's guide, we'll explore how to use LangChain with Ollama (a local AI model runner) to query a MySQL database using natural language.

Rather than writing complex SQL queries, we'll create a system that allows users to ask questions in plain English and get meaningful answers from their database.

## What You'll Learn

- Setting up LangChain with Ollama
- Connecting to a MySQL database
- Creating database query chains
- Handling natural language questions
- Building a simple but powerful database assistant

## Prerequisites

- Python 3.8+
- MySQL database
- Basic Python knowledge
- Ollama installed locally

## Our Sample Database

We'll be working with a simple e-commerce database with two tables:

1. **Products**:
   - id (INT): Primary key
   - name (VARCHAR): Product name
   - price (DECIMAL): Product price
   - category_id (INT): Foreign key to categories table
   - stock (INT): Available inventory
   - description (TEXT): Product description

2. **Categories**:
   - id (INT): Primary key
   - name (VARCHAR): Category name
   - parent_id (INT): Optional parent category

This structure allows for questions like "What are the most expensive products in the Electronics category?" or "Which categories have products with low stock?".

## Code Implementation

Let's build our LangChain database assistant step by step:

### Step 1: Install Required Libraries

```bash
pip install langchain langchain-community langchain-core langchain-openai python-dotenv sqlalchemy pymysql
```

### Step 2: Set Up Your Database

First, let's create our sample database:

```sql
CREATE DATABASE ecommerce;

USE ecommerce;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  description TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert some sample data
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Electronics', NULL),
(2, 'Clothing', NULL),
(3, 'Books', NULL),
(4, 'Laptops', 1),
(5, 'Smartphones', 1),
(6, 'T-shirts', 2),
(7, 'Jeans', 2),
(8, 'Fiction', 3),
(9, 'Non-Fiction', 3);

INSERT INTO products (name, price, category_id, stock, description) VALUES
('MacBook Pro', 1299.99, 4, 45, 'Powerful laptop for professionals'),
('iPhone 15', 899.99, 5, 120, 'Latest smartphone with advanced features'),
('Samsung Galaxy S23', 849.99, 5, 85, 'Android smartphone with great camera'),
('Basic T-shirt', 19.99, 6, 200, 'Comfortable cotton t-shirt'),
('Designer Jeans', 89.99, 7, 75, 'Stylish jeans for all occasions'),
('Python Programming', 49.99, 9, 30, 'Comprehensive guide to Python programming'),
('Science Fiction Anthology', 29.99, 8, 15, 'Collection of award-winning sci-fi stories'),
('Gaming Laptop', 1499.99, 4, 12, 'High-performance laptop for gaming enthusiasts');
```

### Step 3: Create the LangChain Database Assistant

Here's our main script:

```python
# db_assistant.py

import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.chains.sql_database.query import create_sql_query_chain
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage

# Load environment variables
load_dotenv()

# Setup database connection
db_user = os.environ.get("DB_USER", "root")
db_password = os.environ.get("DB_PASSWORD", "")
db_host = os.environ.get("DB_HOST", "localhost")
db_name = "ecommerce"

# Create SQLDatabase instance
db = SQLDatabase.from_uri(
    f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
)

# Setup Ollama model (local)
model = ChatOpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ANYTHING",
    model="mistral",  # Specify your model name here
)

# Create a chain for generating SQL queries from natural language
sql_chain = create_sql_query_chain(model, db)

# Create a more conversational response template
response_prompt = ChatPromptTemplate.from_messages([
    ("system", """
    You are a helpful assistant that explains database query results in a friendly way.

    Given the following:
    1. A user question
    2. The SQL query used to retrieve the data
    3. The query result

    Provide a helpful, conversational response that answers the user's question.
    Focus on insights, not just repeating data. Format data as needed for readability.
    """),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
    ("system", "SQL Query: {query}"),
    ("system", "SQL Result: {result}"),
])

# Create a function to execute SQL and get results
def execute_query(query):
    try:
        return db.run(query)
    except Exception as e:
        return f"Error executing query: {str(e)}"

# Create the full chain
def create_db_chain():
    chain = (
        RunnablePassthrough.assign(query=sql_chain)
        .assign(
            result=lambda vars: execute_query(vars["query"])
        )
        | response_prompt
        | model
        | StrOutputParser()
    )
    return chain

# Main interaction loop
def main():
    print("🤖 Database Assistant")
    print("Ask questions about products and categories in the e-commerce database")
    print("Type 'exit' to quit\n")

    db_chain = create_db_chain()
    chat_history = []

    while True:
        question = input("\nYour question: ")
        if question.lower() in ("exit", "quit"):
            break

        # Process the question
        try:
            response = db_chain.invoke({
                "question": question,
                "chat_history": chat_history
            })
            print("\n" + response)

            # Update chat history
            chat_history.extend([
                HumanMessage(content=question),
                AIMessage(content=response)
            ])

        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
```

### Step 4: Environment Setup

Create a `.env` file in your project directory:

```
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
```

## How It Works

Let's break down how this system works:

1. **Database Connection**: We use SQLAlchemy to connect to our MySQL database through the LangChain SQLDatabase utility.

2. **Language Model**: We configure LangChain to use Ollama's local model (Mistral in this example).

3. **SQL Chain**: The `create_sql_query_chain()` function is a LangChain utility that creates a chain specifically for turning natural language into SQL queries. It automatically:
   - Examines your database schema
   - Creates a prompt with your database structure
   - Generates valid SQL based on the user's question

4. **Response Generation**: After getting the SQL results, we pass them through another prompt to generate human-friendly responses.

5. **Conversation History**: We maintain a chat history to enable follow-up questions.

## Example Questions

Once you've set up the system, you can ask questions like:

- "What are all the products in the Electronics category?"
- "What's the average price of laptops?"
- "Which product has the lowest stock?"
- "How many items do we have in each category?"
- "List all categories with their parent categories"

## Security Considerations

When implementing this in a real-world scenario, keep these security aspects in mind:

### 1. Database Security

- **Restricted User**: Create a database user with limited permissions (READ-only)
- **Connection Security**: Use SSL for database connections in production
- **Environment Variables**: Never hardcode credentials in your script

### 2. SQL Injection Prevention

LangChain's SQL chain helps prevent SQL injection by using SQLAlchemy's parameterized queries, but you should still:

- Validate any direct inputs if you modify the code
- Consider implementing additional validation for generated SQL
- If possible, restrict SQL to only SELECT statements

### 3. Data Privacy

- Be careful about what data is exposed through this interface
- Consider masking sensitive fields in responses
- Implement user authentication before deploying publicly

### 4. Local Model Benefits

Using Ollama locally provides several advantages:

- Data stays on your machine
- No API costs
- Works offline
- Greater privacy

## Enhancing the Application

Here are some ways to improve your LangChain database assistant:

1. **Add More Tables**: Expand the database schema for more complex queries

2. **Custom Tools**: Add specialized functions for specific business logic

3. **Better Error Handling**: Improve error messages and fallback mechanisms

4. **User Interface**: Add a web interface with Streamlit or Flask

5. **Query Logging**: Log questions and responses for analysis

6. **Fine-tuning**: Fine-tune the model on your specific domain

## Conclusion

LangChain provides a powerful framework for connecting language models to databases. By combining it with Ollama's local AI capabilities and a MySQL database, you've created a system that makes data accessible through natural language.

This approach democratizes database access, allowing non-technical team members to get insights without knowing SQL. As language models continue to improve, these types of applications will become increasingly powerful tools in your data toolkit.

The next steps would be to expand the database schema, refine the prompts, and potentially add a user-friendly interface to make this tool accessible to more people in your organization.