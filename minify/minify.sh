ECHO "[COMPILING]"
cd ..
ECHO "....... index.js"
uglifyjs index.js -o minify/coucher/index.js

cp readme.md minify/coucher/readme.md
cp package.json minify/coucher/package.json
cp license.txt minify/coucher/license.txt

cd minify
node minify.js