from mangum import Mangum
from main import app

# Create an event payload similar to the Lambda Function URL event structure
# event = {
#     "requestContext": {
#         "http": {
#             "method": "POST",
#             "path": "/messages"
#         }
#     },
#     "headers": {
#         "Content-Type": "application/json"
#     },
#     "body": "{\"sender\": \"ZA4U8hjwZhaSkKJMI0yursrrVQ73\", \"text\": \"Hello!\", \"conversation_id\": \"6746ce334781d7cbfa6694d8\"}",
#     "isBase64Encoded": False
# }

event = {
    "httpMethod": "POST",  # or GET, depending on your method
    "resource": "/path",   # API path
    "headers": {"Content-Type": "application/json"},
    "body": "{\"sender\": \"ZA4U8hjwZhaSkKJMI0yursrrVQ73\", \"text\": \"Hello!\", \"conversation_id\": \"6746ce334781d7cbfa6694d8\"}",
    "isBase64Encoded": False
}


# Create the Mangum handler
handler = Mangum(app)

# Invoke the handler with the event and a mock context
try:
    response = handler(event, None)
    print("Response: ", response)
except Exception as e:
    print("Error: ", str(e))
