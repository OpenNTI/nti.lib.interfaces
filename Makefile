.PHONY: clean check test

LIB = lib

all: node_modules lib

node_modules: package.json
	@rm -rf node_modules
	@npm install

check:
	@eslint --ext .js,.jsx ./src

test: node_modules clean check
	@jest --coverage

clean:
	@rm -rf $(LIB)
	@rm -rf $(REPORTS)

lib: clean
	@rollup -c
