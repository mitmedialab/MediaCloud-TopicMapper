import logging

from server import config
from server.auth import user_mediacloud_key
from server.platforms.provider import ContentProvider
from server.platforms.reddit_pushshift import RedditPushshiftProvider
from server.platforms.twitter_pushshift import TwitterPushshiftProvider
from server.platforms.web_mediacloud import WebMediaCloudProvider
from server.platforms.twitter_crimson_hexagon import TwitterCrimsonHexagonProvider
from server.platforms.generic_csv import GenericCsvProvider
from server.platforms.web_google import WebGoogleProvider
from server.platforms.youtube_youtube import YouTubeYouTubeProvider

logger = logging.getLogger(__name__)

# static list matching topics/info results
PLATFORM_OPEN_WEB = 'web'
PLATFORM_TWITTER = 'twitter'
PLATFORM_REDDIT = 'reddit'
PLATFORM_GENERIC = 'generic_post'
PLATFORM_FACEBOOK = 'facebook'  # coming soon
PLATFORM_YOUTUBE = 'youtube'  # coming soon

# static list matching topics/info results
PLATFORM_SOURCE_CRIMSON_HEXAGON = 'crimson_hexagon'
PLATFORM_SOURCE_CSV = 'csv'
PLATFORM_SOURCE_POSTGRES = 'postgres'
PLATFORM_SOURCE_MEDIA_CLOUD = 'mediacloud'
PLATFORM_SOURCE_PUSHSHIFT = 'pushshift'
PLATFORM_SOURCE_GOOGLE = 'google'
PLATFORM_SOURCE_CROWD_TANGLE = 'crowd_tangle'  # coming soon
PLATFORM_SOURCE_YOUTUBE = 'youtube'  # coming soon


def provider_for(platform: str, source: str) -> ContentProvider:
    """
    A factory method that returns the appropriate data provider. Throws an exception to let you know if the
    arguments are unsupported.
    :param platform: One of the PLATFORM_* constants above.
    :param source: One of the PLATFORM_SOURCE>* constants above.
    :return:
    """
    if (platform == PLATFORM_OPEN_WEB) and (source == PLATFORM_SOURCE_MEDIA_CLOUD):
        return WebMediaCloudProvider(user_mediacloud_key())
    if (platform == PLATFORM_TWITTER) and (source == PLATFORM_SOURCE_PUSHSHIFT):
        return TwitterPushshiftProvider()
    if (platform == PLATFORM_REDDIT) and (source == PLATFORM_SOURCE_PUSHSHIFT):
        return RedditPushshiftProvider()
    if (platform == PLATFORM_TWITTER) and (source == PLATFORM_SOURCE_CRIMSON_HEXAGON):
        return TwitterCrimsonHexagonProvider(config.get('CRIMSON_HEXAGON_API_KEY'))
    if (platform == PLATFORM_GENERIC) and (source == PLATFORM_SOURCE_CSV):
        return GenericCsvProvider()
    if (platform == PLATFORM_OPEN_WEB) and (source == PLATFORM_SOURCE_GOOGLE):
        return WebGoogleProvider()
    if (platform == PLATFORM_YOUTUBE) and (source == PLATFORM_SOURCE_YOUTUBE):
        YouTubeYouTubeProvider(config.get('YOUTUBE_API_KEY'))
    raise UnknownProviderException(platform, source)


class UnknownProviderException(Exception):
    def __init__(self, platform, source):
        super().__init__("Unknown provider {} from {}".format(platform, source))
