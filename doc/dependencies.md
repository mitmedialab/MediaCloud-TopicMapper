Dependencies
============

We rely on other people's Python packages (via `requirements.txt`) and Node modules (via `packages.json`).

Updating Python Depedencies
---------------------------

These don't change that often, so we don't automatically upgrade.  Good to check every few months.

Updating npm Depedencies
------------------------

It is important to occasionally we upgrade to the latest version of the npm libraries we use. This is something to do every month or so, to make sure we don't fall behind the rapid development  in this libraries.  

To do this:
1. First make sure you have npm-check-updates installed: `npm install -g npm-check-updates`.
2. Run `ncu` to see a report of modules with newer versions available.
3. Any minor version updates you can probably just make in the package.json file. For any major version updates you should go check the release notes for that project to see any breaking changes.
4. Once you've updated any that seem safe, fo a regular `npm install` to install the updates.
5. Run the code and fix any errors that are reported or you see while clicking around.
6. Check in the updated `package.json`.
