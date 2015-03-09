install:
	@npm install

start:
	@make serve & make watch

serve:
	@node node_modules/3w/3w.js / --3000

watch:
	@node_modules/watchify/bin/cmd.js src/boombap.js -o dist/boombap.js -v

build:
	@node_modules/browserify/bin/cmd.js src/boombap.js -o dist/boombap.js

publish:
	@git checkout master
	@make build
	@git add dist && git commit --allow-empty -am "make dist" && git push origin master
	@make tag ghpages

tag:
	@git tag "v$(shell node -e "var config = require('./package.json'); console.log(config.version);")"
	@git push --tags

ghpages:
	@git checkout gh-pages && git merge master && git push origin gh-pages && git checkout master