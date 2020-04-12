from datetime import datetime as dt


def unixToSolrDate(timestamp):
    date = dt.fromtimestamp(timestamp)
    return date.strftime('%Y-%m-%d')
