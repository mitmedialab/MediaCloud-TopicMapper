import requests
from typing import List, Dict

from server import config
from server.cache import cache


CORENLP_URL = config.get('CORENLP_URL')
SNIPPET_WINDOW_SIZE = 150  # how many chars before or after the quote to save for context into the DB


def quotes_from_text(text: str) -> List[Dict]:
    corenlp_results = _fetch_annotations(text)
    quotes = [_result_as_quote(q, text) for q in corenlp_results['quotes'] ]
    return quotes


@cache.cache_on_arguments()
def _fetch_annotations(text: str) -> Dict:
    url = 'http://' + CORENLP_URL + '/?properties={"annotators":"tokenize,ssplit,pos,lemma,ner,depparse,coref,quote","outputFormat":"json"}'
    r = requests.post(url, data=text.encode('utf-8'))
    return r.json()


def _result_as_quote(q: Dict, text: str) -> Dict:
    snippet_begin = max(0, q['beginIndex'] - SNIPPET_WINDOW_SIZE)
    snippet_end = min(q['endIndex'] + SNIPPET_WINDOW_SIZE, len(text))
    info = {
        'index': q['id'],
        'text': q['text'],
        'begin_char': q['beginIndex'],
        'end_char': q['endIndex'],
        'begin_token': q['beginToken'],
        'end_token': q['endToken'],
        'begin_sentence': q['beginSentence'],
        'end_sentence': q['endSentence'],
        'snippet': text[snippet_begin:snippet_end]
    }
    if 'mention' in q:
        info['mention'] = q['mention']
        info['mention_token_distance'] = q['tokenBegin'] - q['mentionBegin']
        info['mention_type'] = q['mentionType']
        info['mention_sieve'] = q['mentionSieve']
    if 'speaker' in q:
        info['speaker'] = q['speaker']
        info['canonicalSpeaker'] = q['canonicalSpeaker']
    return info
