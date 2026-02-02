# Observability Specification

## Logging Standards

We use `structlog` to enforce structured JSON logging in production. This ensures logs are machine-readable and easily queryable in Azure Monitor / Log Analytics.

### Schema
All log entries follow this JSON schema:

```json
{
  "timestamp": "ISO-8601 string",
  "level": "INFO|WARNING|ERROR",
  "logger": "logger_name",
  "event": "event_name_snake_case",
  "context_key": "context_value",
  ...
}
```

**Example:**
```json
{
  "timestamp": "2024-02-02T14:30:00.123Z",
  "level": "INFO",
  "logger": "etl_ingest",
  "event": "ingestion_completed",
  "ingestion_id": "550e8400-e29b-41d4-a716-446655440000",
  "rows_ingested": 1500
}
```

---

## Telemetry Events

### ETL Pipeline Events

| Event Name | Level | Description | Context Keys |
|---|---|---|---|
| `etl_job_started` | INFO | Pipeline execution started | `stage` |
| `etl_job_completed` | INFO | Pipeline finished successfully | `status` |
| `etl_job_failed` | ERROR | Pipeline crashed | `error`, `exc_info` |
| `ingestion_started` | INFO | Started reading source file | `source` |
| `source_file_not_found` | ERROR | Input file missing | `path` |
| `excel_read_success` | INFO | Successfully read Excel file | `row_count` |
| `writing_to_bronze` | INFO | Writing raw data to Delta | `path` |
| `ingestion_completed` | INFO | Ingestion stage finished | `ingestion_id`, `rows_ingested` |
| `transformation_started` | INFO | Started Silver transformation | `stage` |
| `processing_batch` | INFO | Processing specific ingestion batch | `ingestion_id` |
| `writing_to_silver_*` | INFO | Writing to specific Silver table | - |
| `transformation_completed`| INFO | Silver stage finished | `stage` |
| `aggregation_started` | INFO | Started Gold aggregation | `stage` |
| `fact_table_written` | INFO | Fact table populated | `table`, `rows` |
| `kpis_calculated` | INFO | KPI aggregation done | `table`, `rows` |
| `aggregation_failed` | ERROR | Gold stage crashed | `error`, `exc_info` |

---

## Azure Monitor KQL Queries

Use these Kusto Query Language (KQL) queries in Azure Monitor / Application Insights.

### 1. Recent Pipeline Failures
Find any errors in the last 24 hours.

```kql
AppTraces
| where Timestamp > ago(24h)
| where SeverityLevel >= 3 // Error
| project Timestamp, Message, Properties.event, Properties.error
| order by Timestamp desc
```

### 2. Rows Ingested Over Time
Track the volume of data being ingested.

```kql
AppTraces
| where Properties.event == "ingestion_completed"
| project Timestamp, Rows=toint(Properties.rows_ingested), IngestionId=Properties.ingestion_id
| render timechart
```

### 3. Pipeline Duration (Approximation)
Time between start and completion events.

```kql
let starts = AppTraces 
    | where Properties.event == "etl_job_started" 
    | project StartTime=Timestamp, OperationId;
let ends = AppTraces 
    | where Properties.event == "etl_job_completed" 
    | project EndTime=Timestamp, OperationId;
starts 
| join kind=inner ends on OperationId
| project Duration=(EndTime - StartTime), OperationId
| render timechart
```

---

## Dashboard Recommendations

We recommend creating an **Azure Dashboard** or **Grafana Board** with the following panels:

### Panel 1: Pipeline Health Status
*   **Type:** Status Indicator (Red/Green)
*   **Query:** Check for `etl_job_failed` events in the last run.
*   **Goal:** Immediate visibility into broken pipelines.

### Panel 2: Data Volume (Rows Ingested)
*   **Type:** Bar Chart
*   **Metric:** `rows_ingested` from `ingestion_completed` event.
*   **Goal:** Detect anomalies (e.g., zero rows ingested, sudden spikes).

### Panel 3: KPI Freshness
*   **Type:** Single Stat (Time since last update)
*   **Query:** `max(Timestamp)` where `event == 'kpis_calculated'`.
*   **Goal:** Ensure the dashboard data is up-to-date.

### Panel 4: Error Logs Table
*   **Type:** Table
*   **Query:** List distinct error messages from the last 24h.
*   **Goal:** Debugging assistance for engineers.
