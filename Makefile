lint.py:
	pylint server

requirements-local.py:
	pip install -q -r requirements/local.txt --exists-action w
