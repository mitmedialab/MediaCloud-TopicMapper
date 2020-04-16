Media Cloud Web Tools
=====================

This is a shared repository for all the front-facing [Media Cloud](https://mediacloud.org) web tools.
This includes:
 * [Explorer](https://explorer.mediacloud.org)
 * [Source Manager](https://sources.mediacloud.org)
 * [Topic Mapper](https://topics.mediacloud.org)
 * [Tools](https://tools.mediacloud.org)

**Check out the `doc` folder for more documentation.**

Dev Installation
----------------

Git:
 * `git submodule update --init --recursive`

Python:
 * Follow the instructions in `doc/python-versions.md` to setup Python the way we do
 * Once you've got Python setup, install the requirements by running `pip install -r requirements.txt`

Node and npm:  
 * On Windows, make sure to create an environment variable: `set NODE_ENV=dev`
 * make sure your node installation is up-to-date (we work with v8.2.1 right now)
 * `npm install` to install all the package dependencies (as specified in the `package.json`)
 * install watchman for the testing (`brew install --HEAD watchman`)

MongoDB:
[Install MongoDb](https://docs.mongodb.com/manual/installation/).  We develop on OS X and install via the [HomeBrew package manager](http://brew.sh): `brew install mongodb`

Redis:
[Install Redis](http://redis.io/)  We develop on OS X and install via the [HomeBrew package manager](http://brew.sh): `brew install redis`

MemCache:
On OSX, make sure to run `brew install libmemcached` otherwise you'll get an error about pylibmc failing to install (http://brew.sh)
 


Linux Ubuntu setup:
 * find the most recent version nodejs package available:

```bash
$ apt list nodejs
Listing... Done
nodejs/eoan 10.15.2~dfsg-2ubuntu1 amd64
nodejs/eoan 10.15.2~dfsg-2ubuntu1 i386
$ apt list npm
Listing... Done
npm/eoan,eoan 5.8.0+ds6-4 all
```

Currently the package manager will give us node v10.15.2 and  npm v5.8.0, and this might be new enough. If you want something newer then go to npmjs.org for a newer version. No, developers will want to enter by this door: https://github.com/npm/cli. Choose the link 'Super Easy Install -- npm is bundled with node.' and get to https://nodejs.org/en/download/ . Choose the 'Linux Binaries (x64)' link and get node v12.16.2 (as I write this).

But enough of this, let's use the Ubuntu package:

```bash
$ sudo apt-get install -y nodejs
..
$ nodejs -v
v10.15.2
$ sudo apt-get install -y npm
..
..
$ npm -v
5.8.0
```

 * MongoDB:

```bash
$ sudo apt-get install -y mongodb
..
$ mongo --version
MongoDB shell version v3.6.8
$ mongos --version
mongos version v3.6.8
```

 * Redis

```
$ sudo apt-get install -y redis
..
$ redis-server -v
Redis server v=5.0.5 sha=00000000:0 malloc=jemalloc-5.1.0 bits=64 build=8babad91eba747dd
```

 * memcache

```
$ sudo apt-get install -y memcached python3-pylibmc
..
Setting up python3-pylibmc (1.5.2-1build3) ...
..
$ memcached --version
memcached 1.5.10

```




Multi-platform setup:
Coming soon

Configuration
------------- 

Copy `config/server.config.template` to `config/server.config` and fill in the required info there.

Running the Apps
----------------

You need to open two terminal windows and run one thing in each (so the hot-reloading can work):
 * `npm run topics-dev` or `npm run sources-dev`
 * `python run.py`
    - if you get flask errors, run the `pip install -r requirements.txt` line again. On Mac Osx, you may need to run with --ignore-installed

Toolchain
---------

You will make your life easier by installing these tools:
 * [PyCharm](https://www.jetbrains.com/pycharm/) - our IDE of choice for Python development
 * [Redux DevTools Chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
 * [React Developer Tools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi).
 * Set up your environment with [SublimeText](https://www.sublimetext.com) and linting following [these instructions](https://medium.com/planet-arkency/catch-mistakes-before-you-run-you-javascript-code-6e524c36f0c8#.1mela5864).
 * Note - you need to tell Sublime to install the Sublime package control manager and then you need to install the necessary packages using Sublime's command line. That's all there in the link, just make sure you follow the prompts explicity.
 * To browse your local DB on a Mac use [MongoHub](https://github.com/bububa/MongoHub-Mac), or [MongoExpress for a web-based UI](https://github.com/mongo-express/mongo-express)
