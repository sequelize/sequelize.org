CLONE_URL=https://github.com/sequelize/sequelize.git
REPO_NAME=sequelize
BUILD_DIR=site

build_branch () {
    git checkout $1
    
    npm install
    npm run docs
    git stash
    
    rm -rf ../$1
    if [ $1 == "v3" ];then
        mkdocs build --clean
        mv ./site ../$BUILD_DIR/$1
    else
        if [ $1 == "main" ]; then
            mkdir ../$BUILD_DIR/master
            cp -r ./esdoc/* ../$BUILD_DIR/master/
        fi

        mv ./esdoc ../$BUILD_DIR/$1
    fi
}

rm -rf $REPO_NAME
git clone $CLONE_URL

cd $REPO_NAME

build_branch main
build_branch v7
build_branch v6
build_branch v5
build_branch v4
build_branch v3
