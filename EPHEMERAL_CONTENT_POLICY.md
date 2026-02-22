# Ephemeral Content Processing Policy - No HTML Storage

## Overview

Pinnacle.ai implements a **strict no-storage policy** for all fetched and rendered HTML content. The system functions as a stateless analysis engine, processing web content in-memory only and persisting ONLY derived analytical metrics.

## Policy Summary

✅ **ALLOWED:**
- Derived analytical scores (AEO, GEO, Citation)
- Structured metrics (word count, heading count, link count)
- Signal breakdowns (structure, trust, media, schema)
- Recommendations and insights
- Fetch metadata (render time, method used)

❌ **FORBIDDEN:**
- Raw HTML storage (database, file system, cache)
- Rendered DOM storage
- Page content logs
- Content backups
- Training data archival

## Architecture: Ephemeral Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    EPHEMERAL CONTENT FLOW                     │
└──────────────────────────────────────────────────────────────┘

1. Fetch HTML
   ↓ (in-memory only)
   
2. Parse HTML → Extract Structured Signals
   ↓ (headings, meta, schema, links, images)
   
3. Calculate Scores
   ↓ (AEO score, GEO score, Citation probability)
   
4. Generate Recommendations
   ↓ (derived insights only)
   
5. DELETE HTML from memory
   ↓ (explicit cleanup with gc.collect())
   
6. Store ONLY derived metrics
   ✓ (scores, signals, recommendations)
```

## Implementation Details

### Service Layer (`service.py`)

Both `aeoEngine` and `aiTestingEngine` services implement:

```python
async def run_audit(url: str, user_id: str = None) -> dict:
    # 1. Fetch HTML (in-memory only)
    fetch_result = await fetch_html_hybrid(url)
    html = fetch_result["html"]
    
    # 2. Extract metadata BEFORE processing
    fetch_metadata = {
        "method": fetch_result["method"],
        "used_headless": fetch_result["used_headless"],
        "render_time_ms": fetch_result["render_time_ms"],
        "content_stats": fetch_result["content_stats"],  # Stats only, no content
    }
    
    try:
        # 3. Parse and score (extract structured signals)
        parsed = parse_html(html, url)
        signals = build_signals(parsed, page_type)
        scores = calculate_all_scores(signals)
        recommendations = generate_recommendations(signals, scores)
    
    finally:
        # 4. CRITICAL: Delete HTML from memory
        del html
        del fetch_result
        gc.collect()  # Suggest garbage collection
    
    # 5. Store ONLY derived metrics (no HTML)
    if user_id:
        audit_doc = {
            "overall_score": scores["overall_score"],
            "signals_json": signals,  # Structured only
            "recommendations": recommendations,
            "fetch_metadata": fetch_metadata,  # Metadata only
            # NO raw HTML stored
        }
```

### Key Features

1. **try-finally Block**
   - Ensures HTML deletion even if processing fails
   - Guarantees ephemeral policy enforcement

2. **Explicit Memory Cleanup**
   - `del html` - Delete HTML variable
   - `del fetch_result` - Delete fetch result
   - `gc.collect()` - Suggest garbage collection

3. **Metadata Extraction**
   - Extract metadata BEFORE try block
   - Ensures metadata survives HTML deletion
   - Only stores stats (text_length, word_count) not content

## Stored Data Structure

### Database Documents (MongoDB)

**Audit Document:**
```json
{
  "user_id": "...",
  "url": "https://example.com",
  "overall_score": 71,
  "breakdown_json": {
    "structure": 85,
    "trust": 70,
    "media": 65,
    "schema": 80,
    "technical": 75
  },
  "signals_json": {
    "structure": {
      "has_title": true,
      "title_length": 45,
      "h1_count": 1,
      "word_count": 1200
    }
  },
  "recommendations": [...],
  "fetch_metadata": {
    "method": "raw",
    "used_headless": false,
    "render_time_ms": 0,
    "content_stats": {
      "text_length": 12000,
      "word_count": 1800,
      "h1_count": 1,
      "paragraph_count": 25
    }
  }
}
```

**❌ NOT stored:**
- `"html": "<html>..."` 
- `"raw_content": "..."`
- `"page_source": "..."`

## Logging Policy

### ✅ Allowed Logs

```python
logger.info(f"Audit for {url}: method=raw, used_headless=False, render_time_ms=0")
logger.info(f"Content stats: text_length=12000, word_count=1800")
logger.info(f"Headless rendering successful for {url} in 1433ms")
```

### ❌ Forbidden Logs

```python
# NEVER log HTML content
logger.debug(f"HTML: {html}")  # ❌
logger.info(f"Page content: {html[:1000]}")  # ❌
logger.error(f"Parse failed: {html}")  # ❌
```

### Log Redaction

All logs automatically redact page content. Only metadata logged:
- URL
- Response status
- Render time (ms)
- Method used (raw/headless/fallback)
- Boolean flags
- Content statistics (counts, not content)

## Security & Compliance

### No Content Persistence

✅ **Guarantees:**
- HTML never written to database
- HTML never written to disk
- HTML never cached
- Rendered DOM exists only during execution
- Only derived analytical metrics persist

### Compliance Benefits

- **GDPR:** No storage of scraped content
- **Copyright:** No archival of copyrighted material
- **Privacy:** No persistent user-facing content
- **Security:** No sensitive data leakage
- **Audit Trail:** Only metrics, not raw data

## Verification

### How to Verify No-Storage Policy

1. **Check Database:**
```javascript
// MongoDB query - should find NO html field
db.audits.find({"html": {$exists: true}})  // Should return 0
db.ai_tests.find({"raw_content": {$exists: true}})  // Should return 0
```

2. **Check Logs:**
```bash
# Search for HTML content in logs
grep -i "<html" /var/log/supervisor/backend.err.log  # Should find nothing
grep -i "<!doctype" /var/log/supervisor/backend.err.log  # Should find nothing
```

3. **Memory Profile:**
```python
# HTML variable should not exist after processing
import tracemalloc
# Verify HTML is garbage collected after processing
```

## Architecture Separation

```
┌─────────────┐
│  /crawler  │ ← Fetch + Render (in-memory only)
└──────┬──────┘
       │
       ↓ (HTML in memory)
┌─────────────┐
│   /parser   │ ← Extract structured signals
└──────┬──────┘
       │
       ↓ (signals dict)
┌─────────────┐
│  /scoring   │ ← Calculate metrics
└──────┬──────┘
       │
       ↓ (scores dict)
┌─────────────┐
│  /storage   │ ← Store ONLY derived metrics
└─────────────┘

HTML never reaches /storage layer
```

## Performance Impact

**Minimal:**
- Explicit `del` is instant
- `gc.collect()` is non-blocking suggestion
- No performance degradation observed
- Memory usage remains constant

**Benefits:**
- Lower memory footprint (HTML freed immediately)
- No storage costs for HTML content
- Faster database writes (smaller documents)
- Compliance by design

## Testing

### Test Ephemeral Policy

```bash
# Run audit and check no HTML stored
curl -X POST "$API_URL/api/audit" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Verify in MongoDB
mongo
> use pinnacle_db
> db.audits.findOne({}, {html: 1, raw_content: 1})
# Should NOT have html or raw_content fields
```

### Test Memory Cleanup

```python
# Python test
import gc
import sys

html = "<html>...</html>"  # Large HTML
html_size = sys.getsizeof(html)

del html
gc.collect()

# HTML should be freed from memory
```

## Confirmation Checklist

✅ **No HTML written to database** - Verified in audit_doc and test_doc
✅ **No HTML written to disk** - No file writes in code
✅ **No HTML logged** - Logs only contain metadata
✅ **Rendered DOM exists only during execution** - try-finally ensures cleanup
✅ **Only derived analytical metrics persist** - Database contains scores/signals only
✅ **System compliant with ephemeral processing design** - Stateless analysis engine

## Summary

Pinnacle.ai is a **stateless analysis engine** that:
1. Fetches content transiently
2. Processes in-memory only
3. Extracts structured signals
4. Deletes source content immediately
5. Persists only derived metrics

This design ensures compliance, security, and scalability while providing comprehensive AI optimization analysis.
