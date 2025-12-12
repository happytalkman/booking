# server/services/real_time_data_pipeline.py
import asyncio
import aiohttp
import logging
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime, timedelta
import json
import hashlib
from dataclasses import dataclass, asdict
from enum import Enum
import feedparser
import tweepy
import praw
import yfinance as yf
from kafka import KafkaProducer, KafkaCon