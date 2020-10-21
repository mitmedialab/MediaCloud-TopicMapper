import logging

from server.platforms.provider import ContentProvider


class TwitterBrandwatchProvider(ContentProvider):

    def __init__(self):
        super(TwitterBrandwatchProvider, self).__init__()
        self._logger = logging.getLogger(__name__)
