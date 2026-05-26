# AI Detection API Contract

## POST /v1/detect-out

Upload a tennis clip for AI line call analysis.

### Request
- Content-Type: multipart/form-data
- Body:
  - `clip` (file): video file (mp4)
  - `sessionId` (string): ID of the session
  - `clipId` (string): ID of the clip
  - `calibration` (JSON string, optional): court calibration data

### Response 202 Accepted
{ "jobId": "string", "status": "queued" }

## GET /v1/detect-out/:jobId

Poll for result status.

### Response 200 OK (processing)
{ "jobId": "string", "status": "processing" }

### Response 200 OK (complete)
{
  "jobId": "string",
  "status": "complete",
  "decision": "in" | "out" | "uncertain",
  "confidence": number,  // 0.0–1.0
  "boundingBox": { "x": number, "y": number, "w": number, "h": number } | null,
  "courtPosition": { "x": number, "y": number } | null,  // normalized 0–1
  "processingTimeMs": number
}

### Response 200 OK (failed)
{ "jobId": "string", "status": "failed", "error": "string" }

## Error Responses
- 400 Bad Request: invalid clip format
- 413 Payload Too Large: clip exceeds 100MB limit
- 429 Too Many Requests: rate limited
- 500 Internal Server Error
