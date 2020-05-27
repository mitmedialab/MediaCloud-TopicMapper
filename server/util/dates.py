from datetime import datetime as dt

SOLR_DATE_FORMAT = '%Y-%m-%d'


def unix_to_solr_date(timestamp):
    date = dt.fromtimestamp(timestamp)
    return date.strftime(SOLR_DATE_FORMAT)


def solr_date_to_date(date_str):
    return dt.strptime(date_str, SOLR_DATE_FORMAT)
