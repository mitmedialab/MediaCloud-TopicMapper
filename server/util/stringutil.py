import logging
import dateutil
import re

logger = logging.getLogger(__name__)


def ids_from_comma_separated_str(comma_separated_string):
    id_list = []
    if len(comma_separated_string) > 0:
        id_list = [int(cid) for cid in comma_separated_string.split(",") if len(cid) > 0]
    return id_list


def trim_solr_date(date_str):
    return dateutil.parser.parse(date_str).strftime("%Y-%m-%d")


pattern = re.compile(r'(?<!^)(?=[A-Z])')


def camel_to_snake(camel_case: str) -> str:
    return pattern.sub('_', camel_case).lower()


def as_tag_name(user_label):
    formatted_name = re.sub(r'\W|^(?=\d)', '_', user_label)
    return formatted_name
