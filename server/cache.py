from dogpile.cache import make_region
from dogpile.cache.util import compat

from server import config


def _keyword_safe_key_generator(namespace, fn):
    # can't use the default dogpile.cache one because it doesn't respect keyworded args
    if namespace is None:
        namespace = '%s:%s' % (fn.__module__, fn.__name__)
    else:
        namespace = '%s:%s|%s' % (fn.__module__, fn.__name__, namespace)

    # Seems like in later versions this isn't deprecated
    # pylint: disable=deprecated-method
    args = compat.inspect_getargspec(fn)
    has_self = args[0] and args[0][0] in ('self', 'cls')

    def generate_key(*fn_args, **kw):
        kw_keys = ["{}_{}".format(k, v) for k, v in kw.items()]
        if has_self:
            fn_args = fn_args[1:]
        fn_args_as_strings = ["{}".format(arg) for arg in fn_args]
        return namespace + "|" + " ".join(fn_args_as_strings + kw_keys)
    return generate_key


cache = make_region(function_key_generator=_keyword_safe_key_generator).configure(
    'dogpile.cache.redis',
    arguments={
        'url': config.get('CACHE_REDIS_URL'),
        'port': 6379,
        'db': 0,
        'redis_expiration_time': 60*60*24*3,   # 3 days
        'distributed_lock': True
        }
)
