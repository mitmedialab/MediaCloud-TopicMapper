Python Version Management (OSX)
==============================

Our dev codebase currently runs with Python v3.7.x on OSX.  However, that is sure to change. Managing Python
versions can be hard, so this document introduce our approach.
 
PyEnv
-----

We manage different versions with [pyenv](https://github.com/pyenv/pyenv). Install this with HomeBrew:
```
brew update
brew install pyenv
```

Then install the versions of Python we need:
```
pyenv install 3.7.6
```

PyEnv-VirtualEnv
----------------

For managing a virtual environment with a specific version of python for our project, we use 
[pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv). Install this with homebrew as well
```
brew install pyenv-virtualenv
```
As noted in their readme, you'll need to add these two lines to your `.bash_profile` file (or you `.profile` file). Then open a new terminal session:
```
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

And then create a virtualenv for this project.  The name is important, because the `.python-version` file
refers to it so it loads automatically when you enter the directory (if `eval "$(pyenv virtualenv-init -)"` 
is in your `.profile`):
```
pyenv virtualenv 3.7.6 mc-web-tools
```

Ubuntu
------
See the installer at https://github.com/pyenv/pyenv-installer . Install pyenv by saying:

```bash
$ curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer >pyenv-installer
$ bash pyenv-installer
$ exec $SHELL
```
Load pyenv automatically by adding the following to ~/.bashrc:

```bash
export PATH="/home/username/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```
