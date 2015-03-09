install:
	@npm install

start:
	@make _serve & make _watch

publish:
	@git checkout master
	@make _build
	@git add dist && git commit --allow-empty -am "make dist" && git push origin master
	@make _tag _ghpages

_serve:
	@node node_modules/3w/3w.js / --3000

_watch:
	@node_modules/watchify/bin/cmd.js src/boombap.js -o dist/boombap.js -v

_build:
	@node_modules/browserify/bin/cmd.js src/boombap.js -o dist/boombap.js

_tag:
	@git tag "v$(shell node -e "var config = require('./package.json'); console.log(config.version);")"
	@git push --tags

_ghpages:
	@git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master