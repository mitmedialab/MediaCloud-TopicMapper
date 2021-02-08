lint.py:
	pylint server

requirements-local.py:
	pip install -q -r requirements/local.txt --exists-action w

# arguments: app (e.g. tools, sources, topics, explorer), version (e.g. v4.3.4)
# Example: make depoy-app app=topics version=v9.99.9
deploy-app: 
	npm run $(app)-release
	git add server/static/gen/$(app)
	git commit -m "Built $(app) assets"
	git tag $(app)-$(version)
	git push origin --tags
	git push --force prod-$(app) $(app)-$(version):main
