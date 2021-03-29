Using Ubuntu for development
============================

This page is on using Ubuntu for front-end development. Ubuntu for back-end development is discussed elsewhere.

Nodejs setup
------------

To get the current version go to https://npmjs.org .
No, developers will want to enter by this door: https://github.com/npm/cli.
Choose the link 'Super Easy Install -- npm is bundled with node.' and get to https://nodejs.org/en/download/ .
Choose the 'Linux Binaries (x64)' link and get node v12.16.2 (as I write this).

Install according to instructions at https://github.com/nodejs/help/wiki/Installation

```bash
$ cd /usr/local/lib/
$ sudo mkdir -p /usr/local/lib/nodejs
$ sudo tar -xJvf <~user/Downloads/node-$VERSION-$DISTRO.tar.xz> -C /usr/local/lib/nodejs
```

Add to your ~/.profile (with the correct version and distro):
```
# Nodejs
VERSION=v12.16.2
DISTRO=linux-x64
export PATH=/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin:$PATH
```

Update your profile and test that npm is installed:

```
$ . ~/.profile
$ node -v
v12.16.2
$ npm -v
6.14.4
$ npm version
{
  npm: '6.14.4',
  ares: '1.15.0',
  brotli: '1.0.7',
  cldr: '36.0',
  http_parser: '2.9.3',
  icu: '65.1',
  llhttp: '2.0.4',
  modules: '72',
  napi: '5',
  nghttp2: '1.40.0',
  node: '12.16.2',
  openssl: '1.1.1e',
  tz: '2019c',
  unicode: '12.1',
  uv: '1.34.2',
  v8: '7.8.279.23-node.34',
  zlib: '1.2.11'
}
```

Install all the modules in the package.json file (needs a good internet connection):
```
$ cd MediaCloud-Web-Tools
$ npm install
```

https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
https://github.com/nodesource/distributions

Yarn v.s. NPM
-------------

Npm can give you problems if your internet access is not perfect. Npm install does many connections, and one failure sets you back to zero. This and other reasons made me go with yarn at https://yarnpkg.com/ . Simple installation instructions are at https://classic.yarnpkg.com/en/docs/install#debian-stable . Note that this installation also causes the installation of the nodejs Ubuntu packages that we don't want, but this is harmless because our newer nodejs is at the head of PATH.

Now we can install packages:
```
$ yarn install
```

fsevents problem
----------------
The fsevents module is Mac OSX specific, it is only relevant on Mac OS, it does not compile on Linux or Windows. Yarn appears to try and compile it even on incompatible operating system. This is a waste of time as it's always going to fail.
https://github.com/yarnpkg/yarn/issues/2051

We currently have a fsevents dependency in package-lock.json, so let's move it aside by renaming it to something harmless:
```
$ mv package-lock{,.old}.json
```



Webpack
-------
With node and npm installed you will have a choice of webpack commands: 
 * `npm run topics-dev`
 * `npm run sources-dev`
 * `npm run explorer-dev`
 * `npm run tools-dev`

 * `npm run topics-release`
 * `npm run sources-release`
 * `npm run explorer-release`
 * `npm run tools-release`
 
 * `npm run test-acceptance`
 * `npm run requirements-check`
 * `npm run postinstall`

MongoDB
-------

```bash
$ sudo apt-get install -y mongodb
..
$ mongo --version
MongoDB shell version v3.6.8
$ mongos --version
mongos version v3.6.8
```

Redis
-----

```
$ sudo apt-get install -y redis
..
$ redis-server -v
Redis server v=5.0.5 sha=00000000:0 malloc=jemalloc-5.1.0 bits=64 build=8babad91eba747dd
```

memcache
--------

```
$ sudo apt-get install -y memcached python3-pylibmc
..
Setting up python3-pylibmc (1.5.2-1build3) ...
..
$ memcached --version
memcached 1.5.10

```

Configuration
-------------
Now return to the main README file and see the Configuration section.



Nodejs from packages (not recommended)
--------------------

Alternately, you can try to use the Ubuntu packages.
Find the most recent version nodejs package available:

```bash
$ apt list nodejs
Listing... Done
nodejs/eoan 10.15.2~dfsg-2ubuntu1 amd64
nodejs/eoan 10.15.2~dfsg-2ubuntu1 i386
$ apt list npm
Listing... Done
npm/eoan,eoan 5.8.0+ds6-4 all
```

Currently the package manager will give us node v10.15.2 and  npm v5.8.0, and this might be new enough. But no, currently you get incompatible versions.

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
