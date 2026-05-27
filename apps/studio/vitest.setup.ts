// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Payload requires a non-empty secret even in tests.
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'test-payload-secret'
}
