import sys
import structlog
import logging
from typing import Any, Dict


def configure_logger(json_logs: bool = True, log_level: str = "INFO") -> None:
    """
    Configures structlog for the application.

    Args:
        json_logs: If True, outputs logs in JSON format (good for Azure Monitor).
                   If False, outputs pretty-printed logs (good for local dev).
        log_level: The logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
    """

    # Configure standard logging levels
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level.upper(),
    )

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if json_logs:
        # Production mode: JSON output for Azure Monitor / Log Analytics
        processors = shared_processors + [structlog.processors.JSONRenderer()]
    else:
        # Development mode: Pretty printing
        processors = shared_processors + [structlog.dev.ConsoleRenderer()]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
