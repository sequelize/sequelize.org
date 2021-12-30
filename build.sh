CLONE_URL=https://github.com/sequelize/sequelize.git
REPO_NAME=sequelize
BUILD_DIR=site
VERSIONS=("v7" "v6" "v5" "v4" "v3")
VERSIONS_JOINED=$(IFS=,; echo "${VERSIONS[*]}")

build_branch () {
    VERSION=$1

    git checkout $VERSION
    npm install
    npm run docs
    git stash
    rm -rf ../$VERSION

    if [ $VERSION == "v3" ];then
        mkdocs build --clean
        mv ./site ../$BUILD_DIR/$VERSION
    else
        node ../build/inject-version-picker.js \
            --current=$VERSION \
            --versions=$VERSIONS_JOINED \
            --path=./esdoc

        if [ $VERSION == "main" ]; then
            mkdir ../$BUILD_DIR/master
            cp -r ./esdoc/* ../$BUILD_DIR/master/
        fi
        
        mv ./esdoc ../$BUILD_DIR/$VERSION
    fi
}

rm -rf $REPO_NAME
git clone $CLONE_URL

cd $REPO_NAME

build_branch main
for version in ${VERSIONS[@]}; do
    build_branch $version
done
