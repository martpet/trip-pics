export const handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/json' },
  body: JSON.stringify({ message: 'Hello from my Lambda node!' }),
});
