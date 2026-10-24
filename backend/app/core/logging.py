import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures structured, consistent console logging for AeroGrid."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] [AeroGrid] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("aerogrid")
    logger.setLevel(log_level)
    if not logger.handlers:
        logger.addHandler(handler)

    # Prevent duplicate propagation if root logger is touched
    logger.propagate = False
    return logger


logger = setup_logging()
